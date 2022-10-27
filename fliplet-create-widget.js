const path = require('path');
const replace = require('replace');
const ncp = require('ncp').ncp;

ncp.limit = 16;

if (process.argv.length < 4) {
  log('Component name and package is required');
  process.exit();
}

const packageName = process.argv[2].trim().replace(/ /g, '-').toLowerCase();
const widgetName = process.argv[3];
const boilerplate = (process.argv[4] || '').replace('--', '');
const safeName = widgetName.trim().toLowerCase().replace(/ /g, '-').replace(/[^A-z0-9-]/g, '');
const folderPath = path.join(process.cwd(), safeName);

if (!/[A-z]{1,4}\.[A-z-]{3,16}\.[A-z]{3,64}/.test(packageName)) {
  log(`Package name ${packageName} is invalid. Please make sure it follows the reverse domain name notation, e.g. "com.example.my-component"`);
  process.exit();
}

let template;

switch (boilerplate) {
  case 'vue':
    template = 'widget-vue-template';
    break;
  case 'helper':
    template = 'widget-helper-template';
    break;
  default:
    template = 'widget-template';
}

log(`Creating new widget ${widgetName} to ${folderPath} using ${template} boilerplate`);

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
  log('    $ cd ' + safeName);
  log('    $ fliplet run');
  log('');
});

function log() {
  console.log.apply(this, arguments);
}
