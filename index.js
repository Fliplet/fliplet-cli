#!/usr/bin/env node

var program = require('commander');

program
  .version('1.3.0')
  .command('create-widget [name]', 'create a new widget')
  .command('run-widget', 'run the current widget for development')
  .command('publish-widget', 'publish the current widget on fliplet studio')
  .command('list-assets', 'gets the list of the available assets')
  .command('env [name]', 'set the environment: dev, staging or production')
  .command('login', 'Login')
  .command('logout', 'Logout')
  .parse(process.argv);