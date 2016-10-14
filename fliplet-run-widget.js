const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const exec = require('child_process').exec;

const folderPath = process.cwd();
const packagePath = path.join(folderPath, 'widget.json');
const template = require('./lib/template');

const assets = require(path.join(__dirname, 'lib', 'assets'));

var app = express();

var package;
var widgetInstanceData;

const scriptTagsRegExp = /<script.+src=".+".+>/;
const scriptTagsError = [
  '<h2>Script tags to external files are not allowed</h2>',
  '<p>Script tags cannot be placed in your templates. If you need to use inline scripts, ',
  'please reference external assets using the "assets" array in the widget.json file.</p>'
].join('');

const idTagsRegExp = /<.+id=".+".+>/;
const idTagsError = [
  '<h2>ID attributes are not allowed</h2>',
  '<p>HTML tags cannot contain the "id" attribute, because it might conflict if your widget ',
  'gets added twice to a page. Please consider using classes instead.</p>'
].join('');

try {
  package = require(packagePath);
  fs.statSync(packagePath);
} catch (e) {
  log('The widget definition file has not been found (or the JSON syntax is invalid).');
  log('Are you sure you are running this command from a widget folder?');
  process.exit();
}

log('');
log('Please note: if you make any change to the widget dependencies, the server needs to be restarted.')
log('Starting up widget development server for', package.name, '(' + package.package + ')...');
log('');

// --------------------------------------------------------------------------
// Server configuration

app.use(express.static(folderPath, { maxage: '1h' }));
app.use(bodyParser.json({ limit: '10MB' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10MB' }));

// --------------------------------------------------------------------------
// AWS configuration

const runWidgetHtml = template.engine.compile(fs.readFileSync(path.join(__dirname, 'assets', 'run-widget.html'), 'utf8'));
app.get('/', function (req, res) {
  res.send(runWidgetHtml(package));
});

app.get('/build', function (req, res) {
  fs.readFile('./build.html', 'utf8', function (err, html) {
    if (err || typeof html !== 'string') {
      return res.send('The build.html file was not found');
    }

    if (html.match(scriptTagsRegExp)) {
      return res.send(scriptTagsError);
    }

    if (html.match(idTagsRegExp)) {
      return res.send(idTagsError);
    }

    template.compile({
      widgets: [{
        id: Date.now(),
        html: html,
        dependencies: package.build.dependencies,
        assets: package.build.assets,
        data: widgetInstanceData
      }]
    }).then(function (html) {
      res.send(html);
    }, function (err) {
      res.send(err);
    });
  });
});

app.get('/interface', function (req, res) {
  fs.readFile('./interface.html', 'utf8', function (err, html) {
    if (!html) {
      return res.send('The interface.html file was not found');
    }

    if (html.match(scriptTagsRegExp)) {
      return res.send(scriptTagsError);
    }

    template.compile({
      interface: true,
      widgets: [{
        id: Date.now(),
        html: html,
        dependencies: package.interface.dependencies,
        assets: package.interface.assets,
        data: widgetInstanceData
      }]
    }).then(function (html) {
      res.send(html);
    }, function (err) {
      res.send(err);
    });
  });
});

app.post('/save-widget-data', function (req, res) {
  widgetInstanceData = _.assign({}, widgetInstanceData, req.body);
  res.status(200).send();
});

// --------------------------------------------------------------------------
// Startup configuration

const host = 'http://localhost:3000';

app.listen(3000, function () {
  log('[' + package.name + '] development server is up on', host);

  if (process.argv.length > 2) {
    return;
  }

  setTimeout(function () {
    try {
      exec(['open', host].join(' '));
    } catch (e) {
      // nothing really
    }
  }, 500);
});

function log() {
  console.log.apply(this, arguments);
}