import {type BunFile, spawn} from 'bun';
import * as os from "node:os";

export class VercelService {
  token?: string;
  baseUrl = 'https://api.vercel.com';
  projectId: string | null = null;
  orgId: string | null = null;
  tokenPaths: string[] = [`${os.homedir()}/Library/Application\ Support/com.vercel.cli/auth.json`, `${os.homedir()}/.local/share/com.vercel.cli` ];

  async login() {
    if (!(await this.authExists(this.tokenPaths))) {
      const childProc = spawn(['vercel', 'login'], {
        stdin: "inherit",
        stdout: "inherit",
      });
      await childProc.exited
      await this.authExists(this.tokenPaths);
    }
  }

  async createProject(name: string, repo: string, framework: string) {
    const response = await fetch(`${this.baseUrl}/v10/projects`, {
      headers: this.getHeaders(),
      method: "post",
      body: JSON.stringify({
        name,
        framework,
        gitRepository: {
          type: "github",
          repo
        },
      }),
    });

    const body = await response.json();
    this.projectId = (body as {id: string}).id;
    this.orgId = (body as {accountId: string}).accountId;
  };

  async getProjectDomain() {
    let response = await fetch(`https://api.vercel.com/v9/projects/${this.projectId}/domains`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const body = await response.json() as {domains?: {name: string}[]};
    if (body?.domains) {
      return body?.domains[0].name;
    }
    return null;
  }
  async deploy(name: string, url: string) {
    try {
      const response = await fetch("https://api.vercel.com/v13/deployments?forceNew=1&skipAutoDetectionConfirmation=1", {
        method: "post",
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          gitMetadata: {
            remoteUrl: url,
            commitAuthorName: "krew-bot",
            commitMessage: "initial deploy",
            commitRef: "main",
          }
        }),
      });
      const body = await response.json();
      console.log(body);
    } catch (e) {
      console.log(e)
    }
  }

  async deleteProject() {
    if (this.projectId) {
      await fetch(`${this.baseUrl}/v9/projects/${this.projectId}`, {
        headers: this.getHeaders(),
        method: "delete"
      });
      this.projectId = null;
    }
  }

  private getHeaders() {
    return new Headers([["Content-Type", "application/json"], ["Authorization", `Bearer ${this.token}`]])
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
    return json.token;
  }

  async bypassAutomationProtection() {
    const response = await fetch(`https://api.vercel.com/v1/projects/${this.projectId}/protection-bypass`, {
      headers: this.getHeaders(),
      method: 'patch',
      body: JSON.stringify({})
    });
    let bypassObject = await response.json() as {protectionBypass?: { [key: string]: object }};
    if (bypassObject && bypassObject.protectionBypass) {
      return Object.keys(bypassObject.protectionBypass)[0]
    }
    return null
  }

  async deleteProjectByName(name: string) {
    await this.login();
    const response = await fetch(`https://api.vercel.com/v9/projects/${name}`, {
      headers: this.getHeaders(),
    });
    const project = await response.json() as {id: string};
    if ('id' in project) {
      this.projectId = project.id as string;
      await this.deleteProject();
    }
  }
}
