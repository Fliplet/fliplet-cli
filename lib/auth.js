const request = require('request');
const configstore = require('./configstore');
const ENV = require('../lib/env').env;

function login (options) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'POST',
      url: ENV.api_url + 'v1/auth/login',
      form: options
    }, function (error, response, body) {
      if (error) {
        return reject(error);
      }

      body = JSON.parse(body);
      configstore.set('email', body.email);
      configstore.set('auth_token', body.auth_token);

      resolve(body);
    });
  });
}

// Cleans the local user data
function logout () {
  return new Promise(function (resolve, reject) {
    configstore.del('email');
    configstore.del('auth_token');
    resolve();
  });
}

module.exports.login = login;
module.exports.logout = logout;
