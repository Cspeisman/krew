import {BaseFrameworkService, type FrameworkService} from "./FrameworkService";
import {spawn} from "bun";
import type {PackageManager} from "../utils/PackageManager";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export class NextjsService extends BaseFrameworkService implements FrameworkService {
    constructor(packageManager: PackageManager) {
        super(packageManager);
    }

    initializeProject = async (name: string) => {
        const createCommand = this.packageManager.create().split(' ');
        const latestFlag = this.packageManager.name === 'npm' ? '@latest' : '';
        const childProc = spawn([...createCommand, `next-app${latestFlag}`, name, '--', '--ts'], {
            stdin: "inherit",
            stdout: "inherit",
        });

        await childProc.exited;
    }

    addTestingFrameworks = async (path: string) => {
        await super.addTestingFrameworks(path);
    }

    replacePlaceholders(projectPath: string) {
        replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Next')
        replacePlaceholder(`${projectPath}/playwright.config.ts`, '3000')
    }
}
