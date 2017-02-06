#!/usr/bin/env node

const path = require('path');
const package = require(path.join(__dirname, 'package.json'));
const program = require('commander');

program
  .version(package.version)
  .command('create-widget [name]', 'Create a new widget.')
  .command('create-theme [name]', 'Create a new theme.')
  .command('run', 'Run the current widget or theme for development.')
  .command('publish', 'Publish the current widget or theme on fliplet studio.')
  .command('list-assets', 'Gets the list of the available assets in the system.')
  .command('list-organizations', 'Gets the list of the available organizations in the system.')
  .command('organization [id]', 'Set current working organization. Use without id to reset.')
  .command('env [name]', 'Set the environment: dev, staging or production.')
  .command('login', 'Log in with your Fliplet Studio account.')
  .command('logout', 'Log out from Fliplet Studio.')
  .action(function (cmd) {
    if (cmd === 'publish-widget') { console.error('This command has been renamed to "publish".') }
    else if (cmd === 'run-widget') { console.error('This command has been renamed to "run".') }
  })
  .parse(process.argv);