export function getArgValue(args: string[], argName: string) {
  const index = args.indexOf(argName);
  if (index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
}
