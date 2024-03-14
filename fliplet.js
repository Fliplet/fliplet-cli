#!/usr/bin/env node

process.env.NODE_NO_WARNINGS = 1;

require('colors');

const path = require('path');
const package = require(path.join(__dirname, 'package.json'));
const program = require('commander');

program
  .version(package.version)
  .command('create-widget [package] [name]', 'Create a new component using the standard jQuery boilerplate.')
  .command('create-widget [package] [name] --vue', 'Create a new component using the advanced Vue.js-based boilerplate.')
  .command('create-widget [package] [name] --helper', 'Create a new component using the helper framework boilerplate.')
  .command('create-theme [name]', 'Create a new theme.')
  .command('create-menu [name]', 'Create a new menu.')
  .command('run', 'Run the current widget or theme for development.')
  .command('publish', 'Publish the current widget or theme on fliplet studio.')
  .command('run-local', '(Deprecated) Debug the current widget or theme for development.')
  .command('test', 'Run tests on the current widget or theme on fliplet studio.')
  .command('list', 'List widgets you can download for editing.')
  .command('clone [package]', 'Downloads a widget locally, given its ID or package name')
  .command('list-assets', 'Gets the list of the available assets in the system.')
  .command('list-organizations', 'Gets the list of the available organizations in the system.')
  .command('organization [id]', 'Set current working organization. Use without id to reset.')
  .command('env [name]', 'Set the environment: local, development, staging or production.')
  .command('login', 'Log in with your Fliplet Studio account.')
  .command('logout', 'Log out from Fliplet Studio.')
  .command('cleanup', 'Reset the local state of the CLI.')
  .parse(process.argv);
