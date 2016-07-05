const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const ENV = require('../config/env');
const assetsList = require('../config/assets');
const template = require('./template');

const htmlTemplate = template.compile(fs.readFileSync(path.join(__dirname, '../', 'assets', 'widget-template.html'), 'utf8'));

function parseDependencies (list) {
  if (!list || !list.length) {
    return [];
  }

  return [].concat.apply([], _.concat(_.map(list, function (depencency) {
    var outputList = [];
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

    if (assetPackage.dependencies) {
      outputList = outputList.concat(parseDependencies(assetPackage.dependencies));
    }

    var versionAssets = assetPackage.versions[version];

    if (!versionAssets) {
      throw new Error(packageName + ' package version ' + version + ' has not been found');
    }

    versionAssets.forEach(function (asset) {
      var path = ['assets', packageName, version, asset].join('/');

      outputList.push({
        path: path,
        uri: ENV.api_url + path
      })
    });

    return outputList;
  })));
}

function addDependenciesToHtml (options) {
  var css = [], js = [];

  var html = options.html;
  var dependencies = options.dependencies;
  var assets = options.assets;
  var instanceData = options.data || {};
  var widgetInstanceJsData;

  // Common variables
  instanceData.id = Date.now()

  // Compile template
  html = template.compile(html)(instanceData);

  // Expose data as JS data if fliplet-core is defined
  options.rawDependencies.forEach(function (dep) {
    if (dep.indexOf('fliplet-core') === 0) {
      widgetInstanceJsData = `window.__widgetData = { ${instanceData.id}: ${JSON.stringify(instanceData) } };`;
    }
  });

  // Env variables to be used from fliplet-core
  var env = {
    development: true,
    widgetInstanceId: instanceData.id,
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
    env: '<script type="text/javascript">window.ENV=' + JSON.stringify(env) + ';</script>',
    widgetData: widgetInstanceJsData ? `<script type="text/javascript">${widgetInstanceJsData}</script>` : '',
    html: html
  });
}

module.exports.parse = parseDependencies;
module.exports.html = addDependenciesToHtml;