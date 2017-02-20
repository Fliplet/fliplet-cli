# 2. Quickstart

## 1. Install Node.js

Our development tools rely on [Node.js](https://nodejs.org) and [Npm](https://www.npmjs.com). Please install Node.js on your machine before running the next steps.

## 2. Install the Fliplet CLI

The [Fliplet CLI](https://www.npmjs.com/package/fliplet-cli) is available through **Npm** and can be installed from the command line:

```shell
$ npm install -g fliplet-cli
```

Please note: on some systems you might require the `sudo` prefix in order to install the CLI as global (`-g`) on the machine.

Once you have installed the CLI, typing `fliplet` in your command line should print out the available options:

```
$ fliplet

Usage: fliplet [options] [command]

Commands:

  create-widget [name]  Create a new widget.
  create-theme [name]   Create a new theme.
  run                   Run the current widget or theme for development.
  publish               Publish the current widget or theme on fliplet studio.
  list-assets           Gets the list of the available assets in the system.
  list-organizations    Gets the list of the available organizations in the system.
  organization [id]     Set current working organization. Use without id to reset.
  env [name]            Set the environment: dev, staging or production.
  login                 Log in with your Fliplet Studio account.
  logout                Log out from Fliplet Studio.
  help [cmd]            display help for [cmd]

Options:

  -h, --help     output usage information
  -V, --version  output the version number
```

We also regularly update the development tools, so please make sure you're running the latest version when developing components.

You can see the version you have installed by running the command below:

```shell
$ fliplet --version
3.0.1
```

You can check the latest available version of the Fliplet CLI on the [Npm](https://www.npmjs.com/package/fliplet-cli) website.

---

In the next section, you'll learn how to interact with our system.

[Learn the JS APIs →](JS-APIs.md)
{: .buttons}