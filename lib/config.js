const configstore = require('./configstore');
const _ = require('lodash');
// Get the already stored environment if any
var envStored = configstore.get('env');

function getCurrentEnvironment(env) {
  return (env === 'dev' || env === 'staging')
    ? env
    : 'production';
}
var currentEnvironment = getCurrentEnvironment(envStored);
var config = require(`../config/${currentEnvironment}.json`);
config.env = currentEnvironment;
config.getCurrentEnvironment = getCurrentEnvironment;
config.data = configstore.get(currentEnvironment) || {};
config.set = function(key, value) {
  config.data[key] = value;
  configstore.set(currentEnvironment, config.data);
}

module.exports = config;
