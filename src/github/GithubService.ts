import open from 'open';
import {Octokit} from "octokit";
import {$, spawn} from "bun";
import {encrypt} from "./encrypt";
import * as console from "node:console";
import chalk from "chalk";

export class GithubService {
  accessToken = '';
  username = '';
  octokit = new Octokit();
  private sshUrl?: string;

  login = async (scopes: string) => {
    let code;
    const node = spawn(['bun', import.meta.dir + '/../../server.ts'], {
      ipc: (message) => {
        code = message.toString();
        node.kill(1)
      }
    });
    console.log(`To login into Github, navigate to: ${chalk.underline('https://github.com/login/oauth/authorize?client_id=Ov23lig6LGrVOCr4N9tk&redirect_uri=http://localhost:8080/callback&scope=repo,workflow')}`)
    await open(`https://github.com/login/oauth/authorize?client_id=Ov23lig6LGrVOCr4N9tk&redirect_uri=http://localhost:8080/callback&scope=${scopes}`);
    await node.exited;

    const resp = await fetch('https://krew-auth-service.vercel.app/api/auth', {
      method: 'POST',
      body: JSON.stringify({code})
    });

    const body = await resp.json() as { access_token: string; };

    if (body?.access_token) {
      console.log(chalk.green('successfully authenticated!'))
      this.accessToken = body.access_token;
      this.octokit = new Octokit({auth: this.accessToken});
      this.username = await this.getUserName();
    }
  }

  commit = async (name: string) => {
    try {
      const response = await this.octokit.request('POST /user/repos', {
        name,
        homepage: `${name}.vercel.app`,
        private: false,
        auto_init: true,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      this.sshUrl = response.data.ssh_url;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error! ${error.message}`);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  }

  push = async (repo: string) => {
    await $`git remote add origin https://${this.username}:${this.accessToken}@github.com/${this.username}/${repo}.git`;
    await $`git add . && git commit -m "initial commit"`
    await $`git push -f origin main`
    await $`git remote rm origin && git remote add origin ${this.sshUrl}`
  }

  createSecrets = async (repo: string, secrets: { secretName: string, secretValue: string }[]) => {
    for (const {secretName, secretValue} of secrets) {
      const {key, keyId} = await this.getEncryptionKey(repo) ?? {};
      let encryptedValue = await encrypt(secretValue, key);
      await this.octokit.request(`PUT /repos/${this.username}/${repo}/actions/secrets/${secretName}`, {
        owner: this.accessToken,
        repo,
        secret_name: secretName,
        encrypted_value: encryptedValue,
        key_id: keyId,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
    }

  }

  async createRepo(name: string) {
    if (!this.username) {
      await this.login('repo,workflow');
    }
    await this.commit(name);
  }

  updateRepoHomepage = async (repo: string, homepage: string) => {
    await this.octokit.request(`PATCH /repos/${this.username}/${repo}`, {
      homepage,
    });
  }

  getActionsUrl(name: string) {
    return `https://github.com/${this.username}/${name}/actions`;
  }

  async getEncryptionKey(repo: string) {
    try {
      const res = await this.octokit.request(`GET /repos/${this.username}/${repo}/actions/secrets/public-key`, {
        owner: 'OWNER',
        repo: 'REPO',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      return {key: res.data.key, keyId: res.data.key_id}
    } catch (e) {
      console.error(e);
    }
  }

  private async getUserName() {
    let resp = await this.octokit.request('GET /user', {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return resp.data.login;
  }


  delete = async ({owner, repo}: { owner: string, repo: string }) => {
    await this.login('delete_repo');
    const response = await this.octokit.request(`DELETE /repos/${owner}/${repo}`, {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.status === 204;
  }

  async getRepoNameAndOwner() {
    let remoteUrl = await $`git remote get-url origin`.text();
    const url = remoteUrl.trim();
    let match;

    if (url.startsWith('https://')) {
      // HTTPS URL format
      match = url.match(/https:\/\/github\.com\/([^/]+)\/(.+?)(\.git)?$/);
    } else if (url.startsWith('git@')) {
      // SSH URL format
      match = url.match(/git@github\.com:([^/]+)\/(.+?)(\.git)?$/);
    } else {
      throw new Error(`Unexpected URL format: ${url}`);
    }

    if (match) {
      const [, owner, repo] = match;
      return {owner, repo: repo.replace('.git', '')};
    }
    throw new Error(`Could not parse owner and repo from URL: ${url}`);
  }
}
