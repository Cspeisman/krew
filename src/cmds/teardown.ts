import {VercelService} from "../platforms/vercel/VercelService";
import {GithubService} from "../github/GithubService";

export async function teardown() {
  let vercelService = new VercelService();
  let githubService = new GithubService();

  try {
    let repoAndOwner = await githubService.getRepoNameAndOwner();
    process.stdout.write(`About delete ${repoAndOwner.owner}/${repoAndOwner.repo} please type "confirm": `);

    for await (const line of console) {
      if (line.trim() === 'confirm') {
        let successfullyDeletedRepo = await githubService.delete(repoAndOwner);
        if (successfullyDeletedRepo) {
          await vercelService.deleteProjectByName(repoAndOwner.repo);
        }
        break;
      }

      if (line.trim().toUpperCase() === 'N') {
        break;
      }

      process.stdout.write(`Looks like you didn't confirm. Please type "confirm" to continue tearing down your project or N to quit: `);
    }
  } catch (e) {
    console.error(e)
  }
}
