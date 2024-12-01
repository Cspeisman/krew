import type {PackageManager} from "../utils/PackageManager";
import {$, spawn} from "bun";
import {BaseFrameworkService, type FrameworkService, makeRaw} from "./FrameworkService";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export class AstroService extends BaseFrameworkService implements FrameworkService {


  constructor(packageManager: PackageManager) {
    super(packageManager);
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

  async postCreateActions(opts?: Record<string, string>) {
    if (opts?.platform && opts.platform === 'vercel') {
      let astroAddVercel = this.packageManager.npx('astro', 'add vercel --yes');
      await $`${makeRaw(astroAddVercel)}`
    }
  }

  async addTestingFrameworks(path: string) {
    await super.addTestingFrameworks(path);
  }

  replacePlaceholders(projectPath: string) {
    replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Astro')
    replacePlaceholder(`${projectPath}/playwright.config.ts`, '4321')
  }
}
