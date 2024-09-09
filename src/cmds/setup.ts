import {existsSync} from "node:fs";
import {$} from "bun";
import chalk from "chalk";
import {determinePackageManager} from "../utils/PackageManager";
import {VercelService} from "../vercel/VercelService";
import {RemixService} from "../frameworks/RemixService";
import {GithubService} from "../github/GithubService";
import {AstroService} from "../frameworks/AstroService";
import type {FrameworkService} from "../frameworks/FrameworkService";
import {NextjsService} from "../frameworks/NextjsService";
import {SvelteKitService} from "../frameworks/SvelteKitService";

export const setup = async (name: string, framework?: string) => {
  const packageManager = determinePackageManager();
  let frameworkService: FrameworkService;
  if (framework && framework === 'remix') {
    frameworkService = new RemixService(packageManager);
  } else if (framework && framework === 'nextjs'){
    frameworkService = new NextjsService(packageManager);
  } else if (framework && framework === 'svelte'){
    frameworkService = new SvelteKitService(packageManager);
  } else {
    frameworkService = new AstroService(packageManager);
  }
  let vercelService = new VercelService();

  let githubService = new GithubService();


  if (existsSync(name)) {
    console.log("Looks like a project already exists with this name. Please choose a new name");
    process.exit(1);
  }

  await frameworkService.initializeProject(name);
  $.cwd(name);

  if (frameworkService.installAdditionalDependencies) {
    await frameworkService.installAdditionalDependencies();
  }
  await frameworkService.addTestingFrameworks(`${process.cwd()}/${name}`);
  await githubService.createRepo(name);

  await vercelService.login();

  if (!vercelService.token) {
    console.error('error: sorry we had trouble finding the token to call vercel')
  } else {
    await vercelService.createProject(name, `${githubService.username}/${name}`, framework ?? 'astro')
    const projectBypassSecret = await vercelService.bypassAutomationProtection();
    await $`rsync -a ${import.meta.dir}/../../templates/ ./`;
    frameworkService.replacePlaceholders(`${process.cwd()}/${name}`);
    await githubService.createSecrets(name, [
      {
        secretName: 'VERCEL_ORG_ID',
        secretValue: vercelService.orgId ?? ''
      },
      {
        secretName: 'VERCEL_PROJECT_ID',
        secretValue: vercelService.projectId ?? ''
      }, {
        secretName: 'VERCEL_TOKEN',
        secretValue: vercelService.token ?? ''
      }, {
        secretName: 'VERCEL_AUTOMATION_BYPASS_SECRET',
        secretValue: projectBypassSecret ?? ''
      }
    ]);
    await githubService.push(name);
    console.log('Successfully setup application!');
    console.log(`You can see your application's deploy workflow running here: ${chalk.underline(githubService.getActionsUrl(name))}`)
    const vercelURL = await vercelService.getProjectDomain();
    if (vercelURL) {
      console.log(`Once the deploy workflow has completed, you can visit your application at ${chalk.underline(`https://${vercelURL}`)}`);
      await githubService.updateRepoHomepage(name, `https://${vercelURL}`);
    }
  }
}
