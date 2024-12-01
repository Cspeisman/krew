#! /usr/bin/env bun
import {teardown} from "./src/cmds/teardown";
import {getArgValue, help} from "./src/utils/cliHelpers";
import {createSelection} from "bun-promptx";
import {setup} from "./src/cmds/setup";
import {NetlifyService} from "./src/platforms/netlify/NetlifyService.ts";
import {$} from "bun";

const hasDestroyFlag = Bun.argv.includes("--destroy");
const hasHelpFlag = Bun.argv.includes("-h") || Bun.argv.includes("--h");

if (hasDestroyFlag) {
  await teardown()
} else if (hasHelpFlag) {
  help();
} else {
let name = Bun.argv[2];


  if (!name || name.startsWith('--')) {
    console.log("no name was provided")
    process.exit(1);
  }

  let framework = getArgValue(Bun.argv, '--framework')
  if (!framework) {
    let frameworks = [
      {text: 'astro'},
      {text: 'remix' },
      {text: 'nextjs'},
      {text: 'svelte'},
    ];
    const {selectedIndex} = createSelection(frameworks, {
       headerText: "Select your framework"
     })

    if (selectedIndex) {
     framework = frameworks[selectedIndex].text;
    }
  }

  let platform = getArgValue(Bun.argv, '--platform')
  if (!platform) {
    let platforms = [
      {text: 'netlify'},
      {text: 'vercel' },
      {text: 'fly.io'},
    ];
    const {selectedIndex} = createSelection(platforms, {
      headerText: "What platform are you deploying to?"
    })
    platform = platforms[selectedIndex ?? 0].text;
  }
  await setup(name, framework, platform);
}
