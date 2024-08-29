# create-krew

A CLI tool to quickly set up an Astro project with GitHub repository, Vercel deployment, and CI/CD pipeline.


## Usage

To create a new project, run:
`npm create krew@latest your-project-name`

Replace `your-project-name` with the desired name for your project.


## Features

- ✅ Creates a new Astro application
- ✅ Initializes a GitHub repository
- ✅ Deploys the Astro application to Vercel
- ✅ Sets up a CI/CD pipeline using GitHub Actions

## Prerequisites
- GitHub account
- Vercel account
- node version 18.x and up

## What it does

1. Creates a new Astro project
2. Initializes a Git repository
3. Creates a new repository on GitHub
4. Sets up GitHub Actions for CI/CD
   1. includes unit tests
   2. e2e tests that test against the preview deploy
5. Deploys the application to Vercel

## Configuration

During the setup process, you'll be prompted to:
- Sign into github and authenticate Krew Oauth app
- Sign into Vercel if you haven't already from your local machine

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

## Support

If you encounter any problems or have any questions, please open an issue on the GitHub repository.
