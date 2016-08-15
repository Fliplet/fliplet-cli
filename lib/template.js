const Handlebars = require('handlebars');
const request = require('request');

const config = require('./config');

function compile (options) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'POST',
      url: config.api_url + 'v1/widgets/compile',
      gzip: true,
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