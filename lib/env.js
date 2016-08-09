const configstore = require('./configstore');

var envStored = configstore.get('env');

function getEnvironment(env) {
  return (env === 'dev' || env === 'staging')
    ? env
    : 'production';
}


const ENV = require('../config/' + getEnvironment(envStored));

console.log(ENV);

module.exports.getEnvironment = getEnvironment;
module.exports.env = ENV;
