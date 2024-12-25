import {existsSync} from "node:fs";
import {$} from "bun";
import chalk from "chalk";
import {determinePackageManager} from "../utils/PackageManager";
import {VercelService} from "../platforms/vercel/VercelService";
import {RemixService} from "../frameworks/RemixService";
import {GithubService} from "../github/GithubService";
import {AstroService} from "../frameworks/AstroService";
import type {FrameworkService} from "../frameworks/FrameworkService";
import {NextjsService} from "../frameworks/NextjsService";
import {SvelteKitService} from "../frameworks/SvelteKitService";
import type {PlatformService} from "../platforms/PlatformService";
import {NetlifyService} from "../platforms/netlify/NetlifyService";

export const setup = async (name: string, framework?: string, platform?: string) => {
  const packageManager = determinePackageManager();
  let frameworkService: FrameworkService;
  if (framework && framework === 'remix') {
    frameworkService = new RemixService(packageManager);
  } else if (framework && framework === 'nextjs') {
    frameworkService = new NextjsService(packageManager);
  } else if (framework && framework === 'svelte') {
    frameworkService = new SvelteKitService(packageManager);
  } else {
    frameworkService = new AstroService(packageManager);
  }
  let platformService: PlatformService = new VercelService(packageManager);
  if (platform && platform === 'netlify') {
    platformService = new NetlifyService(packageManager);
  }

  let githubService = new GithubService();


  if (existsSync(name)) {
    console.log("Looks like a project already exists with this name. Please choose a new name");
    process.exit(1);
  }

  await frameworkService.initializeProject(name);
  $.cwd(name);

  if (frameworkService.postCreateActions) {
    await frameworkService.postCreateActions();
  }
  await frameworkService.addTestingFrameworks(`${process.cwd()}/${name}`);
  await githubService.createRepo(name);

  await platformService.login();

  if (!platformService.token) {
    console.error('error: sorry we had trouble finding the token to call vercel')
  } else {
    await $`rsync -a ${import.meta.dir}/../platforms/${platform}/templates/ ./`;
    await platformService.createProject(name, `${githubService.username}/${name}`, framework ?? 'astro')
    frameworkService.replacePlaceholders(`${process.cwd()}/${name}`);
    let actionSecrets = await platformService.getActionSecrets();
    await githubService.createSecrets(name, actionSecrets);
    await githubService.push(name);
    console.log('Successfully setup application!');
    console.log(`You can see your application's deploy workflow running here: ${chalk.underline(githubService.getActionsUrl(name))}`)
    const siteUrl = await platformService.getProjectDomain();
    if (siteUrl) {
      console.log(`Once the deploy workflow has completed, you can visit your application at ${chalk.underline(siteUrl)}`);
      await githubService.updateRepoHomepage(name, siteUrl);
    }
  }
}
