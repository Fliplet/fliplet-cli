#!/usr/bin/env node

var program = require('commander');

program
  .version('0.0.1')
  .command('create-widget [name]', 'create a new widget')
  .command('run-widget', 'run the current widget for development')
  .parse(process.argv);