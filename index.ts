#! /usr/bin/env bun
import {teardown} from "./src/cmds/teardown.ts";
import {setup} from "./src/cmds/setup.ts";
import {getArgValue} from "./src/utils/getArgumentValue.ts";
import {createSelection} from "bun-promptx";

const hasDestroyFlag = Bun.argv.includes("--destroy");
const hasHelpFlag = Bun.argv.includes("-h") || Bun.argv.includes("--h");

if (hasDestroyFlag) {
  await teardown()
} else if (hasHelpFlag) {

} else {

  let framework = getArgValue(Bun.argv, '--framework')
  if (!framework) {
    let frameworks = [
      {text: 'astro'},
      {text: 'remix' },
      {text: 'nextjs'},
    ];
    const {selectedIndex} = createSelection(frameworks, {
       headerText: "Select your framework"
     })

    if (selectedIndex) {
     framework = frameworks[selectedIndex].text;
    }
  }
  await setup(Bun.argv[2], framework);
}
