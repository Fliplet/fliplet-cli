const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const ENV = require('../config/env');
const assetsList = require('../config/assets');

const htmlTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, '../', 'assets', 'widget-template.html'), 'utf8'));

function parseDependencies (list) {
  if (!list || !list.length) {
    return [];
  }

  return _.uniq([].concat.apply([], _.concat(_.map(list, function (depencency) {

    var depencency = depencency.split(':');
    var packageName = depencency[0];
    var version = depencency.length > 1 ? depencency[1] : undefined;
    var assetPackage = assetsList[packageName];

    if (!assetPackage) {
      throw new Error('Package has not been found');
    }

    if (!version) {
      version = Object.keys(assetPackage.versions)[0];
    }

    var versionAssets = assetPackage.versions[version];

    if (!versionAssets) {
      throw new Error(packageName + ' package version ' + version + ' has not been found');
    }

    return versionAssets.map(function (asset) {
      var path = ['assets', packageName, version, asset].join('/');

      return {
        path: path,
        uri: ENV.api_url + path
      }
    });
  }))));
}

function addDependenciesToHtml (html, dependencies, assets) {
  var css = [], js = [];

  var env = {
    development: true,
    widgetInstanceId: Date.now(),
    apiUrl: ENV.api_url
  };

  assets.forEach(function (asset) {
    dependencies.push({
      path: asset,
      uri: asset
    });
  });

  dependencies.forEach(function (depencency) {
    var tmp = depencency.path.split('.');
    var ext = tmp[tmp.length-1];

    switch (ext) {
      case 'js': js.push(depencency.uri); break;
      case 'css': css.push(depencency.uri); break;
    }
  });

  css = css.map(function (url) {
    return '<link rel="stylesheet" type="text/css" href="' + url + '" charset="utf-8"/>';
  });

  js = js.map(function (url) {
    return '<script type="text/javascript" src="' + url + '"></script>';
  });

  return htmlTemplate({
    css: css.join("\r\n"),
    js: js.join("\r\n"),
    env: '<script type="text/javascript">window.env=' + JSON.stringify(env) + ';</script>',
    html: html
  });
}

module.exports.parse = parseDependencies;
module.exports.html = addDependenciesToHtml;