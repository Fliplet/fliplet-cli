const fs = require('fs');
const express = require('express');
const Handlebars = require('handlebars');
const path = require('path');

const folderPath = process.cwd();
const packagePath = path.join(folderPath, 'widget.json');

const assets = require(path.join(__dirname, 'lib', 'assets'));

var app = express();

var package;

try {
  package = require(packagePath);
  fs.statSync(packagePath);
} catch (e) {
  log('The widget definition file has not been found.');
  log('Are you sure you are running this command from a widget folder?');
  process.exit();
}

// --------------------------------------------------------------------------
// Server configuration

app.use(express.static(folderPath, { maxage: '1h' }));

// --------------------------------------------------------------------------
// AWS configuration

const runWidgetHtml = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'assets', 'run-widget.html'), 'utf8'));
app.get('/', function (req, res) {
  res.send(runWidgetHtml(package));
});

app.get('/build', function (req, res) {
  fs.readFile('./build.html', 'utf8', function (err, data) {
    if (!data) {
      return res.send('The build.html file was not found');
    }

    res.send(assets.html(data, assets.parse(package.build.dependencies)));
  });
});

app.get('/interface', function (req, res) {
  fs.readFile('./interface.html', 'utf8', function (err, data) {
    if (!data) {
      return res.send('The interface.html file was not found');
    }

    res.send(assets.html(data, assets.parse(package.interface.dependencies)));
  });
});

// --------------------------------------------------------------------------
// Startup configuration

app.listen(3000, function () {
  console.log('[' + package.name + '] development server is up on http://localhost:3000');
});

function log() {
  console.log.apply(this, arguments);
}