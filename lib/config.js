const configstore = require('./configstore');
const _ = require('lodash');
// Get the already stored environment if any
var envStored = configstore.get('env');

function getCorrectEnvironment(env) {
  return (env === 'dev' || env === 'staging')
    ? env
    : 'production';
}
var correctEnvironment = getCorrectEnvironment(envStored);
config = require(`../config/${correctEnvironment}.json`);
config.env = correctEnvironment;
config.getCorrectEnvironment = getCorrectEnvironment;
config.data = configstore.get(correctEnvironment) || {};
config.set = function(key, value) {
  config.data[key] = value;
  configstore.set(correctEnvironment, config.data);
}

module.exports = config;
