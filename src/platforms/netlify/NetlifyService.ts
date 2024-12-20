import * as Bun from "bun";
import {$, type BunFile, spawn} from "bun";
import * as os from "node:os";
import type {PlatformService} from "../PlatformService";
import {checkPackage, type PackageManager} from "../../utils/PackageManager";
import * as console from "node:console";
import {makeRaw} from "../../frameworks/FrameworkService";

export class NetlifyService implements PlatformService {
  packageManager: PackageManager;

  constructor(packageManager: PackageManager) {
    this.packageManager = packageManager;
  }

  token?: string;
  siteId?: string;
  tokenPaths: string[] = [`${os.homedir()}/Library/Preferences/netlify/config.json`, `${os.homedir()}/.config/netlify/config.json`];

  login = async () => {
    const result = await $`pwd`.quiet();
    const path = result.text().trim()
    await this.checkOrInstallCliTool();
    if (!(await this.authExists(this.tokenPaths))) {
      const childProc = spawn(['npx', 'netlify', 'login'], {
        cwd: path,
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
    if (json.users) {
      // @ts-ignore
      return Object.values(Object.values(json.users))[0].auth.token;
    }
    return false;
  }

  async createProject(name: string) {
    let pwd = (await $`pwd`.quiet()).text().trim();
    if (!this.token) {
      return;
    }

    if (!this.siteId) {
      await this.netlifyInit(name, pwd);
    }

    console.log('deploying first build to netlify....');
    const childProc = spawn(['npx', 'netlify', 'deploy', '--prod', '-a', this.token, '--site', this.siteId!, '--build'], {
      cwd: pwd,
      stdin: "inherit",
      stdout: "inherit",
    });

    await childProc.exited

    let astroAddVercel = this.packageManager.npx('astro', 'add netlify --yes');
    await $`${makeRaw(astroAddVercel)}`
  }

  async getActionSecrets() {
    return Promise.resolve([{secretName: 'SITE_ID', secretValue: this.siteId ?? ''}, {
      secretName: 'NETLIFY_TOKEN',
      secretValue: this.token ?? ''
    }]);
  }

  async getProjectDomain() {
    return null;
  }

  async netlifyInit(name: string, pwd: string) {
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

  private async checkOrInstallCliTool() {
    if (!checkPackage('netlify-cli')) {
      console.log('installing netlify cli');
      await $`${makeRaw(this.packageManager.installDevDependency('netlify-cli'))}`
    }
  }
}
