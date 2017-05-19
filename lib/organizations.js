const request = require('request');
const config = require('./config');

var organizationsList;
var user = config.data.user || {};
var auth_token = user.auth_token;

function getOrganizationsListFromServer() {
  return new Promise(function (resolve, reject) {
    if (!auth_token) {
      return reject('You must login first with: fliplet login');
    }

    if (organizationsList) {
      return resolve(organizationsList);
    }

    request(config.api_url + 'v1/organizations?auth_token=' + auth_token, function (error, response, body) {
      if (error) {
        return reject(error);
      }

      organizationsList = JSON.parse(body).organizations;
      resolve(organizationsList);
    });
  });
}

module.exports.getOrganizationsList = getOrganizationsListFromServer;
