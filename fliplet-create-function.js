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
const widgetDescription = process.argv[4];
const iconPath = process.argv[5];
const safeName = widgetName.trim().toLowerCase().replace(/ /g, '-').replace(/[^A-z0-9-]/g, '');
const folderPath = path.join(process.cwd(), safeName);

if (!/[A-z]{1,4}\.[A-z-]{3,32}\.function\.[A-z]{3,64}/.test(packageName)) {
  log(`Package name ${packageName} is invalid. Please make sure it follows the reverse domain name notation with the ".function." middle part, e.g. "com.example.function.my-component"`);
  process.exit();
}

if (!/\.function\./.test(packageName)) {
  log(`Package name ${packageName} is missing the function part requirement. It should contain ".function." in the name, e.g. "com.example.function.message"`);
  process.exit();
}

if (iconPath) {
  const fileType =  path.extname(iconPath);

  const supportedImageType = ['.png'];

  if (supportedImageType.indexOf(fileType) === -1) {
    log('Invalid file type. Please upload an image with one of the following extensions: .png');
    process.exit();
  }
}

const template = 'function-template';

log(`Creating new function ${widgetName} to ${folderPath}.`);

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

  replace({
    regex: '{{description}}',
    replacement: widgetDescription,
    paths: [folderPath],
    recursive: true,
    silent: true
  });

  if (iconPath) {
    const destination = path.join(process.cwd(), safeName, 'img', `icon${path.extname(iconPath)}`);

    ncp(iconPath, destination, function(err) {
      if (err) {
        return console.error(err);
      }

      log(`The function has been successfully created in the folder "${safeName}".\r\n`);
    });
  } else {
    log(`The function has been successfully created in the folder "${safeName}".\r\n`);
  }
});

function log() {
  console.log.apply(this, arguments);
}

