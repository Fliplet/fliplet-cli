const configstore = require('./configstore');

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

module.exports = config;
