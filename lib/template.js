const Handlebars = require('handlebars');
const request = require('request');

const config = require('./config');
const configstore = require('./configstore');

function compile (options) {
  var url = config.api_url + 'v1/widgets/compile';
  var authToken = configstore.get('auth_token');

  if (authToken) {
    url += `?auth_token=${authToken}`
  }

  return new Promise(function (resolve, reject) {
    request({
      method: 'POST',
      url,
      gzip: true,
      json: options
    }, function (error, response, body) {
      if (error) {
        return reject(error);
      }

      resolve(body);
    });
  });
}

module.exports.engine = Handlebars;
module.exports.compile = compile;