import type {PackageManager} from "../utils/PackageManager";
import {$, spawn} from "bun";
import type {FrameworkService} from "./FrameworkService";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export const makeRaw = (command: string) => ({raw: command})

export class AstroService implements FrameworkService {
  constructor(private packageManager: PackageManager) {
  }

  async initializeProject(name: string) {
    const createCommand = this.packageManager.create().split(' ');
    const latestFlag = this.packageManager.name === 'npm' ? '@latest' : '';
    const childProc = spawn([...createCommand, `astro${latestFlag}`, name, '--', '--git', '--install'], {
      stdin: "inherit",
      stdout: "inherit",
    });

    await childProc.exited;
  }

  async installAdditionalDependencies() {
    let astroAddVercel = this.packageManager.npx('astro', 'add vercel --yes');
    await $`${makeRaw(astroAddVercel)}`
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
    replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Astro')
  }
}
