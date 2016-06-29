const fs = require('fs');
const express = require('express');
const path = require('path');

const folderPath = process.cwd();
const packagePath = path.join(folderPath, 'widget.json');

var package;

try {
  package = require(packagePath);
  fs.statSync(packagePath);
} catch (e) {
  log('The widget definition file has not been found.');
  log('Are you sure you are running this command from a widget folder?');
  process.exit();
}

var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('[' + package.name + '] development server is up on http://localhost:3000');
});

function log() {
  console.log.apply(this, arguments);
}