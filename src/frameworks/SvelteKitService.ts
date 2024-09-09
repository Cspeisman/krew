import type {FrameworkService} from "./FrameworkService";
import {$, spawn} from "bun";
import type {PackageManager} from "../utils/PackageManager";
import {makeRaw} from "./AstroService";

export class SvelteKitService implements FrameworkService {
  private packageManager: PackageManager;

  constructor(packageManager: PackageManager) {
    this.packageManager = packageManager;
  }

  async initializeProject(name: string) {
    const createCommand = this.packageManager.create().split(' ');
    const latestFlag = this.packageManager.name === 'npm' ? '@latest' : '';
    const childProc = spawn([...createCommand, `svelte${latestFlag}`, name, '--', '--git', '--install'], {
      stdin: "inherit",
      stdout: "inherit",
    });

    await childProc.exited;
  }

  async addTestingFrameworks(path: string) {
    await $`${makeRaw(this.packageManager.installDevDependency('vitest'))}`
    await $`${makeRaw(this.packageManager.installDevDependency('@playwright/test'))}`
    await $`${makeRaw(this.packageManager.installDevDependency('@types/node'))}`
    const scripts = {
      "test": "vitest",
      "test:e2e": this.packageManager.npx('playwright', 'test'),
      "test:e2e:ui": this.packageManager.npx('playwright', 'test --ui'),
    }
    const packageJsonFile = Bun.file(`${path}/package.json`, {type: "application/json"});
    let packageJson = await packageJsonFile.json();
    packageJson.scripts = {...packageJson.scripts, ...scripts};
    await Bun.write(`${path}/package.json`, JSON.stringify(packageJson, null, 2));
  }

  replacePlaceholders(projectPath: string) {

  }

  async installAdditionalDependencies() {
    await $`${makeRaw(`${this.packageManager.name} install`)}`;
  }

}
