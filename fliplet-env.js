const auth = require('./lib/auth');
const config = require('./lib/config');
const configstore = require('./lib/configstore');

const environment = process.argv[2].trim();

configstore.set('env', config.getCorrectEnvironment(environment));
