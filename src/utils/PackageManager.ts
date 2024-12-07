import * as fs from "node:fs";
import * as path from "node:path";
import {readFileSync} from "fs";

export interface PackageManager {
  name: 'npm' | 'yarn' | 'pnpm';

  create(): string;

  npx(command: string, args: string): string;

  installDevDependency(packageName: string): string;
}

class NPM implements PackageManager {
  name: 'npm' = 'npm';

  create() {
    return 'npm create -y';
  }

  npx(command: string, args: string): string {
    return `npx ${command} ${args}`
  }


  installDevDependency(name: string) {
    return `npm install --save-dev ${name}`
  }
}

class Yarn implements PackageManager {
  name: 'yarn' = 'yarn'

  create() {
    return 'yarn create';
  }

  npx(command: string, args: string): string {
    return `yarn ${command} ${args}`
  }

  installDevDependency(name: string) {
    return `yarn add --dev ${name}`
  }
}

class PNPM implements PackageManager {
  name: 'pnpm' = 'pnpm';

  create() {
    return 'pnpm create'
  }

  npx(command: string, args: string) {
    return `pnpm exec ${command} ${args}`
  }

  installDevDependency(name: string) {
    return `pnpm add --save-dev ${name}`
  }
}

export function determinePackageManager(): PackageManager {
  if (process.env['npm_config_user_agent']) {
    if (process.env['npm_config_user_agent'].includes('yarn'))
      return new Yarn();
    if (process.env['npm_config_user_agent'].includes('pnpm'))
      return new PNPM();
    return new NPM();
  }
  return new NPM();
}

export function checkPackage(packageName: string) {
  // Check in node_modules
    try {
      let packageJsonPath: string = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
      const packageJson = JSON.parse(packageJsonPath);

      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      return !!deps[packageName];
    } catch (err) {
      return false;
    }
}
