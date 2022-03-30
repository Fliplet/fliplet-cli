# Quickstart

Our primary development tool is called [Fliplet CLI](https://github.com/Fliplet/fliplet-cli) (Command Line Interface), it's written in [Node.js](https://nodejs.org) and is available through [Npm](https://www.npmjs.com/package/fliplet-cli).

This means in order to start the development you will need to install [Node.js](https://nodejs.org) on your machine.

The **Fliplet CLI** will enable you to develop and test components and themes on your machine, without having to rely on our APIs or even be connected to the internet while coding.

## 1. Install Node.js

Our development tools rely on [Node.js](https://nodejs.org) and [Npm](https://www.npmjs.com). Please install Node.js on your machine before running the next steps.

## 2. Install the Fliplet CLI

[![Fliplet/fliplet-cli - GitHub](https://gh-card.dev/repos/Fliplet/fliplet-cli.svg)](https://github.com/Fliplet/fliplet-cli)

The [Fliplet CLI](https://www.npmjs.com/package/fliplet-cli) is available through **Npm** and can be installed from the command line:

```bash
npm install -g fliplet-cli
```

Please note: on some systems you might require the `sudo` prefix in order to install the CLI as global (`-g`) on the machine.

Once you have installed the CLI, typing `fliplet` in your command line should print out the available options:

```bash
$ fliplet

Usage: fliplet [options] [command]

Commands:

  create-widget [name]  Create a new component.
  create-theme [name]   Create a new theme.
  create-menu [name]    Create a new menu.
  run                   Run the current component or theme for development.
  publish               Publish the current component or theme on fliplet studio.
  test                  Run tests on the current component or theme on fliplet studio.
  list                  List components you can download for editing.
  clone <package>       Downloads a component locally from the target environment, given the specified ID or package name
  list-assets           Gets the list of the available assets in the system.
  list-organizations    Gets the list of the available organizations in the system.
  organization [id]     Set current working organization. Use without id to reset.
  env [name]            Set the environment: local, development, staging or production. Use without name to get the current environment.
  login                 Log in with your Fliplet Studio account.
  logout                Log out from Fliplet Studio.
  cleanup               Reset the local state of the CLI.
  help                  Display help for fliplet

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

### How to update the development tools

We regularly update the development tools, so please make sure you're running the latest version when developing components.

To check for updates, use the npm command `outdated`:

```bash
npm outdated
```

To install or update to the latest version, simply run the install command as follows:

```bash
npm install -g fliplet-cli
```

You can see the version you have installed by running the command below:

```bash
$ fliplet --version
5.2.3
```

You can check the latest available version of the Fliplet CLI on the [npm](https://www.npmjs.com/package/fliplet-cli) website.

---

In the next section, you'll learn how to interact with our system.

[Learn the JS APIs →](JS-APIs.md)
{: .buttons}
