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
    return 'yarn init -y';
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
    return 'pnpm init'
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
