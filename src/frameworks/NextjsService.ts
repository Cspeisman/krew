import type {FrameworkService} from "./FrameworkService";
import {$, spawn} from "bun";
import type {PackageManager} from "../utils/PackageManager";
import {makeRaw} from "./AstroService";
import {replacePlaceholder} from "../utils/replacePlaceholder";

export class NextjsService implements FrameworkService {
    constructor(private packageManager: PackageManager) {
    }

    initializeProject = async (name: string) => {
        const createCommand = this.packageManager.create().split(' ');
        const latestFlag = this.packageManager.name === 'npm' ? '@latest' : '';
        const childProc = spawn([...createCommand, `next-app${latestFlag}`, name, '--ts'], {
            stdin: "inherit",
            stdout: "inherit",
        });

        await childProc.exited;
    }

    addTestingFrameworks = async (path: string) => {
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
        replacePlaceholder(`${projectPath}/e2e/example.spec.ts`, 'Next')
    }
}
