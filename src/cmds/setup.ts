import fs from "node:fs";
import {$} from "bun";
import chalk from "chalk";
import {determinePackageManager} from "../PackageManager.ts";
import {VercelService} from "../vercel/VercelService.ts";
import {LocalRemixService} from "../frameworks/LocalRemixService.ts";
import {GithubService} from "../github/GithubService.ts";
import {LocalAstroService} from "../frameworks/LocalAstroService.ts";
import type {FrameworkService} from "../frameworks/FrameworkService.ts";

export const setup = async (name?: string, framework?: string) => {
  const packageManager = determinePackageManager();
  let frameworkService: FrameworkService;
  if (framework && framework === 'remix') {
    frameworkService = new LocalRemixService(packageManager);
  } else {
    frameworkService = new LocalAstroService(packageManager);
  }
  let vercelService = new VercelService();

  let githubService = new GithubService();

  if (!name) {
    console.log("no name was provided")
    process.exit(1);
  }

  if (fs.existsSync(name)) {
    console.log("Looks like a project already exists with this name. Please choose a new name");
    process.exit(1);
  }

  await frameworkService.initializeProject(name);
  $.cwd(name);
  // await localAstroService.addVercelAdapter();
  await frameworkService.addTestingFrameworks(`${process.cwd()}/${name}`);
  await githubService.createRepo(name);

  await vercelService.login();

  if (!vercelService.token) {
    console.error('error: sorry we had trouble finding the token to call vercel')
  } else {
    await vercelService.createProject(name, `${githubService.username}/${name}`)
    const projectBypassSecret = await vercelService.bypassAutomationProtection();
    await $`rsync -a ${import.meta.dir}/../../templates/ ./`;
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
