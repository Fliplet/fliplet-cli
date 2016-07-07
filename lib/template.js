const Handlebars = require('handlebars');
const request = require('request');

const ENV = require('../config/env');

function compile (options) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'POST',
      url: ENV.api_url + 'v1/widgets/compile',
      // gzip: true,
      // 'Content-type': 'application/json',
      form: options
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