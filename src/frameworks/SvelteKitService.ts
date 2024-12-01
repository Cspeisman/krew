import {BaseFrameworkService, type FrameworkService, makeRaw} from "./FrameworkService";
import {$, spawn} from "bun";
import type {PackageManager} from "../utils/PackageManager";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export class SvelteKitService extends BaseFrameworkService implements FrameworkService {
  constructor(packageManager: PackageManager) {
    super(packageManager);
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

  async addTestingFrameworks(path: string): Promise<void> {
    await super.addTestingFrameworks(path);
  }

  replacePlaceholders(projectPath: string) {
    replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, '')
    replacePlaceholder(`${projectPath}/playwright.config.ts`, '5173')
  }

  async postCreateActions() {
    await $`${makeRaw(`${this.packageManager.name} install`)}`;
  }
}
