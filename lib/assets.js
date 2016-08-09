const request = require('request');

const config = require('./config');

var assetsList;

function getAssetsListFromServer () {
  return new Promise(function (resolve, reject) {
    if (assetsList) {
      return resolve(assetsList);
    }

    request(config.api_url + 'v1/widgets/assets', function (error, response, body) {
      if (error) {
        return reject(error);
      }

      assetsList = JSON.parse(body).assets;
      resolve(assetsList);
    });
  });
}

module.exports.getAssetsList = getAssetsListFromServer;