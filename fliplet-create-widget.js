const path = require('path');
const replace = require('replace');
const ncp = require('ncp').ncp;

ncp.limit = 16;

if (process.argv.length < 3) {
  log('Widget name is required');
  process.exit();
}

const widgetName = process.argv[2];
const boilerplate = (process.argv[3] || '').replace('--', '');
const safeName = widgetName.trim().toLowerCase().replace(/ /g, '-').replace(/[^A-z0-9-]/g, '');
const packageName = widgetName.trim().replace(/ /g, '-').toLowerCase();
const folderPath = path.join(process.cwd(), packageName);

log('Creating new widget', widgetName, 'to', folderPath);

if (boilerplate && boilerplate !== 'vue') {
  console.log('Chosen boilerplate is not valid.');
  process.exit();
}

const template = boilerplate === 'vue'
  ? 'widget-vue-template'
  : 'widget-template';

ncp(path.join(__dirname, template), folderPath, function(err) {
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
    regex: '{{safeName}}',
    replacement: safeName,
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
  log('    $ fliplet run');
  log('');
});

function log() {
  console.log.apply(this, arguments);
}
