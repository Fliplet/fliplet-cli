const request = require('request');

const ENV = require('../config/env');

var assetsList;

function getAssetsListFromServer () {
  return new Promise(function (resolve, reject) {
    if (assetsList) {
      return resolve(assetsList);
    }

    request(ENV.api_url + 'v1/widgets/assets', function (error, response, body) {
      if (error) {
        return reject(error);
      }

      assetsList = JSON.parse(body).assets;
      resolve(assetsList);
    });
  });
}

module.exports.getAssetsList = getAssetsListFromServer;