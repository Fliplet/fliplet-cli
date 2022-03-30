const configstore = require('./configstore');
const _ = require('lodash');

// Get the already stored environment if any
const envStored = configstore.get('env');

function getCurrentEnvironment(env) {
  return (['local', 'dev', 'development', 'staging'].indexOf(env) !== -1)
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
};

config.get = function(key, defaultValue) {
  return _.get(config.data, key, defaultValue);
};

module.exports = config;
