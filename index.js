#!/usr/bin/env node

var program = require('commander');

program
  .version('1.3.0')
  .command('create-widget [name]', 'create a new widget')
  .command('run-widget', 'run the current widget for development')
  .command('install-widget', 'install the current widget for development')
  .command('list-assets', 'gets the list of the available assets')
  .command('login', 'Login')
  .command('logout', 'Logout')
  .parse(process.argv);