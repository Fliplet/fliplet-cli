const Handlebars = require('handlebars');
const request = require('request');

const config = require('./config');

function compile (options) {
  const url = config.api_url + 'v1/widgets/compile';
  const user = config.get('user');

  if (user.authToken) {
    url += `?auth_token=${user.authToken}`
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
