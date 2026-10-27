const Handlebars = require('handlebars');
const request = require('request');

const config = require('./config');

function compile(options) {
  const url = config.api_url + 'v1/widgets/compile';
  const user = config.get('user');
  const headers = {};

  // NOTE: this reads `authToken`, while every other call site in this repo reads
  // `auth_token` (lib/auth.js, lib/organizations.js, lib/publish.js). Preserved
  // verbatim so this change stays a pure transport swap — but if the stored
  // shape is `auth_token`, this has always been sending no credential at all.
  if (user && user.authToken) {
    headers['Auth-token'] = user.authToken;
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
