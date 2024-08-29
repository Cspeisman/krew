#! /usr/bin/env bun
import {teardown} from "./src/cmds/teardown.ts";
import {setup} from "./src/cmds/setup.ts";
import {getArgValue} from "./src/utils/getArgumentValue.ts";


const hasDestroyFlag = Bun.argv.includes("--destroy");
const hasHelpFlag = Bun.argv.includes("-h") || Bun.argv.includes("--h");

if (hasDestroyFlag) {
  await teardown()
} else if (hasHelpFlag) {

} else {
  const framework = getArgValue(Bun.argv, '--framework')
  await setup(Bun.argv[2], framework);
}
