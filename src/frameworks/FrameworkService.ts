import type {PackageManager} from "../utils/PackageManager";
import {$} from "bun";

export const makeRaw = (command: string) => ({raw: command})
export interface FrameworkService {
  initializeProject: (name: string) => Promise<void>;

  addTestingFrameworks: (projectPath: string) => Promise<void>;

  replacePlaceholders: (projectPath: string) => void;

  postCreateActions?: () => Promise<void>
}

export class BaseFrameworkService {
  packageManager: PackageManager;

  constructor(packageManager: PackageManager) {
    this.packageManager = packageManager;
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

}
