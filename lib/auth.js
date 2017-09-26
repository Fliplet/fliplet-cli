const request = require('request');

const config = require('./config');

function login (options) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'POST',
      url: config.api_url + 'v1/auth/login',
      form: options
    }, function (error, response, body) {
      if (error) {
        return reject({ error, response, body });
      }

      if (response.statusCode !== 200) {
        return reject({ error, response, body });
      }

      const user = JSON.parse(body);
      config.set('user', user);
      resolve(user);
    });
  });
}

// Cleans the local user data
function logout () {
  config.set('user', null);
  return Promise.resolve();
}

// Check if user is admin
function isAdmin () {
  var auth_token = config.data.user.auth_token;
  if (!auth_token) {
    Promise.reject('You must login first with: fliplet login');
  }
  return new Promise(function (resolve, reject) {
    request({
      method: 'GET',
      url: `${config.api_url}v1/user?auth_token=${auth_token}`
    }, function (error, response, body) {
      if (error) {
        reject(error);
      }

      if (response.statusCode !== 200) {
        reject(body);
      }

      body = JSON.parse(body);
      if (body.error) {
        reject(body);
      }

      resolve(body.user.isAdmin);
    });
  });
}

module.exports.login = login;
module.exports.logout = logout;
module.exports.isAdmin = isAdmin;
