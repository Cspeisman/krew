import chalk from "chalk";

export function getArgValue(args: string[], argName: string) {
  const index = args.indexOf(argName);
  if (index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
}

export function printHelp({
                            commandName,
                            headline,
                            usage,
                            tables,
                            description,
                          }: {
  commandName: string;
  headline?: string;
  usage?: string;
  tables?: Record<string, [command: string, help: string][]>;
  description?: string;
}) {
  const linebreak = () => '';
  const table = (rows: [string, string][], { padding }: { padding: number }) => {
    const split = process.stdout.columns < 60;
    let raw = '';

    for (const row of rows) {
      if (split) {
        raw += `    ${row[0]}\n    `;
      } else {
        raw += `${`${row[0]}`.padStart(padding)}`;
      }
      raw += '  ' + chalk.dim(row[1]) + '\n';
    }

    return raw.slice(0, -1); // remove latest \n
  };

  let message = [];

  if (headline) {
    message.push(
      linebreak(),
      `${chalk.magenta(commandName)} ${headline}`,
    );
  }

  if (usage) {
    message.push(linebreak(), `${chalk.green(commandName)} ${chalk.bold(usage)}`);
  }

  if (tables) {
    function calculateTablePadding(rows: [string, string][]) {
      return rows.reduce((val, [first]) => Math.max(val, first.length), 0);
    }
    const tableEntries = Object.entries(tables);
    const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding(rows)));
    for (const [, tableRows] of tableEntries) {
      message.push(linebreak(), table(tableRows, { padding }));
    }
  }

  if (description) {
    message.push(linebreak(), `${description}`);
  }

  console.log(message.join('\n') + '\n');
}

export function help() {
  printHelp({
    commandName: 'create-krew',
    usage: '[name] [...flags]',
    headline: 'Scaffold the infrastructure for your project',
    tables: {
      Flags: [
        ['--help (-h)', 'See all available flags.'],
        ['--framework <astro|remix|nextjs>', 'Specify your framework of choice.'],
        ['--destroy', 'Tear down application\'s github and vercel project'],
      ],
    },
  });
}
