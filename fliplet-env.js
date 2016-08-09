const auth = require('./lib/auth');
const ENV = require('./lib/env');
const configstore = require('./lib/configstore');

const environment = process.argv[2].trim();

configstore.set('env', ENV.getEnvironment(environment));