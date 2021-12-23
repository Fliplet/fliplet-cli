const config = require('./lib/config');
const configstore = require('./lib/configstore');

const environments = ['local', 'development', 'staging', 'production'];

let input = process.argv[2];

if (environments.indexOf(input) === -1) {
  console.error(`[ERROR] Environment value is not valid. Accepted values are ${environments.join(', ')}`);
  process.exit(1);
}

const environment = config.getCurrentEnvironment(input);

configstore.set('env', environment);
console.log(`Environment set to ${environment}`);
