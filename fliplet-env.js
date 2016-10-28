const config = require('./lib/config');
const configstore = require('./lib/configstore');

const environment = config.getCorrectEnvironment(process.argv[2]);
configstore.set('env', environment);
console.log(`Environment set to ${environment}`);