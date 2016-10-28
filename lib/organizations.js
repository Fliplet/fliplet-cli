const request = require('request');
const config = require('./config');
const configstore = require('./configstore');

var organizationsList;
var auth_token = configstore.get('auth_token');

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
