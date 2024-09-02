#! /usr/bin/env bun
import {teardown} from "./src/cmds/teardown.ts";
import {setup} from "./src/cmds/setup.ts";
import {getArgValue} from "./src/utils/getArgumentValue.ts";
import {prompt} from "@astrojs/cli-kit";

const hasDestroyFlag = Bun.argv.includes("--destroy");
const hasHelpFlag = Bun.argv.includes("-h") || Bun.argv.includes("--h");

if (hasDestroyFlag) {
  await teardown()
} else if (hasHelpFlag) {

} else {

  let framework = getArgValue(Bun.argv, '--framework')
  if (!framework) {
     const {framework: selectedFramework} = await prompt({
      name: 'framework',
      type: 'select',
      label: '',
      message: 'Which framework would you like to use?',
      initial: 'astro',
      choices: [
        {value: 'astro', label: 'Astro'},
        {value: 'remix', label: 'Remix'},
        {value: 'nextjs', label: 'Nextjs'},
      ],
    })
     framework = selectedFramework;
  }
  await setup(Bun.argv[2], framework);
}
