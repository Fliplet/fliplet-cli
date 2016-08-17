#!/usr/bin/env node

var program = require('commander');

program
  .version('1.7.0')
  .command('create-widget [name]', 'Create a new widget')
  .command('run-widget', 'Run the current widget for development')
  .command('publish-widget', 'Publish the current widget on fliplet studio')
  .command('list-assets', 'Gets the list of the available assets in the system')
  .command('env [name]', 'Set the environment: dev, staging or production')
  .command('login', 'Log in with your Fliplet Studio account')
  .command('logout', 'Log out from Fliplet Studio')
  .parse(process.argv);