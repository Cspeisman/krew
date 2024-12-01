import {$, type BunFile, spawn} from "bun";
import * as os from "node:os";
import type {PlatformService} from "../PlatformService.ts";

export class NetlifyService implements PlatformService {
  token?: string;
  siteId?: string;
  tokenPaths: string[] = [`${os.homedir()}/Library/Preferences/netlify/config.json`, `${os.homedir()}/.config/netlify/config.json`];

  login = async () => {
    if (!(await this.authExists(this.tokenPaths))) {
      const childProc = spawn(['npx', 'netlify', 'login'], {
        stdin: "inherit",
        stdout: "inherit",
      });
      await childProc.exited
      await this.authExists(this.tokenPaths);
    }
  }

  async authExists(paths: string[]) {
    if (this.token) {
      return true;
    }

    let exists: boolean = false;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const file = Bun.file(path);
      if (await file.exists() && file.type.includes('application/json')) {
        this.token = await this.getTokenFromFile(file);
        exists = !!this.token;
        break;
      }
    }

    return exists
  }

  async getTokenFromFile(file: BunFile) {
    let json = await file.json();
    // @ts-ignore
    return Object.values(Object.values(json.users))[0].auth.token;
  }

  async createProject(name: string) {
    if (!this.token) {
      return;
    }
    if (!this.siteId) {
      await this.netlifyInit(name);
    }
    const childProc = spawn(['npx', 'netlify', 'deploy', '--prod', '-a', this.token, '--site', name, '--build', '--json'], {
      stdin: "inherit",
      stdout: "inherit",
    });

    await childProc.exited
  }

  async getActionSecrets(){
    return Promise.resolve([{secretName: 'SITE_ID', secretValue: this.siteId ?? ''}, {
      secretName: 'NETLIFY_TOKEN',
      secretValue: this.token ?? ''
    }]);
  }

  async getProjectDomain(){
    return null;
  }

  async netlifyInit(name: string) {
    let pwd = (await $`pwd`).text().trim();
    const childProc = spawn(['npx', 'netlify', 'sites:create', '--name', name], {
      cwd: pwd,
      stdin: "inherit",
      stdout: "inherit",
    });

    await childProc.exited;
    const file = Bun.file(`${pwd}/.netlify/state.json`)
    await file.exists();
    const json = await file.json()
    this.siteId = json.siteId;
  }
}
