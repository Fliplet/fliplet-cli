const Handlebars = require('handlebars');
const request = require('request');

const config = require('./config');

function compile(options) {
  const url = config.api_url + 'v1/widgets/compile';
  const user = config.get('user');
  const headers = {};

  if (user && user.authToken) {
    headers['Auth-Token'] = user.authToken;
  }

  return new Promise(function(resolve, reject) {
    request({
      method: 'POST',
      url,
      headers,
      gzip: true,
      json: options
    }, function(error, response, body) {
      if (error) {
        return reject(error);
      }

      resolve(body);
    });
  });
}

module.exports.engine = Handlebars;
module.exports.compile = compile;
