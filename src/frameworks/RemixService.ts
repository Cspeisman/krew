import type {PackageManager} from "../utils/PackageManager.ts";
import {$, spawn} from "bun";
import {makeRaw} from "./AstroService.ts";
import type {FrameworkService} from "./FrameworkService.ts";
import {replacePlaceholder} from "../utils/replacePlaceholder.ts";

export class RemixService implements FrameworkService {
  constructor(private packageManager: PackageManager) {
  }

  async initializeProject(name: string) {
    const createCommand = this.packageManager.create().split(' ');
    const latestFlag = this.packageManager.name === 'npm' ? '@latest' : '';
    const childProc = spawn([...createCommand, `remix${latestFlag}`, name, '--', '--yes'], {
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
    replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Remix')
  }
}