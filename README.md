# create-krew

A CLI tool to quickly scaffold your project's infrastructure. It streamlines the setup process by automating the creation of GitHub repositories, Vercel deployments, and CI/CD pipelines.

## Features
- ✅ Supports popular frameworks: astro, remix, and nextjs
- ✅ Initializes a GitHub repository
- ✅ Deploys the application to Vercel (supports astro by default)
- ✅ Sets up GitHub Actions for CI/CD
- ✅ Easily tears down the application with the same speed as scaffolding

## Usage

To create a new project, run:

```bash
npm create krew@latest your-project-name --framework astro
```


### CLI Flags

May be provided in place of prompts

| Name                      | Description                                                                                                                           |
|:--------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| `--help` (`-h`)           | Display available flags.                                                                                                              |
| `--framework <framework>` | Specify your framework of choice (options: `astro`/`remix`/`nextjs`)                                                                  |
| `--destroy`               | Tears down the entire application. Deletes github repository<br/> and deletes vercel project. CAUTION: THIS IS IRREVERSIBLE           |


## What it does
1. Scaffolds a new project using the selected framework.
2. Initializes a local Git repository.
3. Creates a remote repository on GitHub.
4. Sets up GitHub Actions for continuous integration and deployment (CI/CD).
   - Includes unit tests and end-to-end (E2E) tests, running against preview deploys.
5. Deploys the application to Vercel.


## Prerequisites
Before using create-krew, ensure you have the following:
- A GitHub account
- A Vercel account
- Node.js version 18.x or higher

## Setup Process
During setup, you'll be prompted to:
- Sign into GitHub and authenticate the Krew OAuth app.
- Sign into Vercel, if you haven't done so already.

## Teardown
To remove all resources created by create-krew, use the `--destroy` flag:

```bash
create-krew --destroy
```
**Warning**: This action is irreversible and will delete your GitHub repository and Vercel project.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Support

If you encounter any problems or have any questions, please open an issue on the GitHub repository.
