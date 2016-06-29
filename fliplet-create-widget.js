const path = require('path');
const replace = require('replace');
const ncp = require('ncp').ncp;

ncp.limit = 16;

if (process.argv.length < 3) {
  log('Widget name is required');
  process.exit();
}

const widgetName = process.argv[2];
const packageName = widgetName.trim().replace(/ /g, '-').toLowerCase();
const folderPath = path.join(process.cwd(), packageName);

log('Creating new widget', widgetName, 'to', folderPath);

ncp(path.join(__dirname, 'widget-template'), folderPath, function (err) {
  if (err) {
    return console.error(err);
  }

  replace({
    regex: '{{name}}',
    replacement: widgetName,
    paths: [folderPath],
    recursive: true,
    silent: true
  });

  replace({
    regex: '{{package}}',
    replacement: packageName,
    paths: [folderPath],
    recursive: true,
    silent: true
  });

  log('Widget has been successfully created. To run it for development:');
  log('');
  log('    $ cd ' + packageName);
  log('    $ fliplet run-widget');
  log('');
});

function log() {
  console.log.apply(this, arguments);
}