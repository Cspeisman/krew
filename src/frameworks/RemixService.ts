import type {PackageManager} from "../utils/PackageManager";
import {spawn} from "bun";
import {BaseFrameworkService, type FrameworkService} from "./FrameworkService";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export class RemixService extends BaseFrameworkService implements FrameworkService {

  constructor(packageManager: PackageManager) {
    super(packageManager);
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
    await super.addTestingFrameworks(path)
  }


  replacePlaceholders(projectPath: string) {
    replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Remix')
    replacePlaceholder(`${projectPath}/playwright.config.ts`, '5173')
  }
}
