/**


[] Publish changes on file change

[] Should automatically run “npm run build/watch” behind the scenes if necessary and wait for that process to finish before it syncs the files

[] Be as fast as possible in making changes live (e.g. no recompilation)

[] Widget scoped to current studio user (package, name, orgId, etc)

[] Can only run on staging, development and local

[] Works on widgets, helpers, menus, themes

[] Should support multiple concurrent processes on different directories

 */

const _ = require('lodash');
const spawn = require('child_process').spawn;
const moment = require('moment');
const notifier = require('node-notifier');
const grunt = require('grunt');
const path = require('path');

const configstore = require('./lib/configstore');
const publish = require('./lib/publish');
const gruntFile = require('./lib/gruntfile');

const folderPath = process.cwd();
const widgetPackagePath = path.join(folderPath, 'widget.json');
const themePackagePath = path.join(folderPath, 'theme.json');
const menuPackagePath = path.join(folderPath, 'menu.json');
const npmPackagePath = path.join(folderPath, 'package.json');

const isWindows = process.platform === 'win32';

let buildProcess;
let widgetPackage;
let npmPackage;

grunt.log.header = function() {};

grunt.task.init = function() {};

function log(str) {
  console.log(`${moment().format().magenta} ${str}`);
}

function error(str) {
  console.error(`${moment().format().red} ${str.red.underline}`);
}

(async function() {
  const user = publish.getUser();

  if (!user) {
    return console.error('Please log in first via the "fliplet login" command.');
  }

  log(`[USER] Logged in as ${user.fullName.green}. ${'Press Ctrl+C to exit at any time.'.blue}`);

  try {
    widgetPackage = require(widgetPackagePath);
    log(`Loaded the ${widgetPackage.name.yellow} component.`);
  } catch (e) {
    try {
      widgetPackage = require(themePackagePath);
      log(`Loaded the ${widgetPackage.name.yellow} theme.`);
    } catch (e) {
      widgetPackage = require(menuPackagePath);
      log(`Loaded the ${widgetPackage.name.yellow} menu.`);
    }
  }

  try {
    npmPackage = require(npmPackagePath);
    log('A npm package file has been loaded from disk.');
  } catch (e) {
    log('A npm package file has not been found'.yellow);
  }

  const hasNpmScript = !!_.get(npmPackage, 'scripts.watch');
  let gruntFinished;
  let npmFinished = !hasNpmScript;

  const gruntCallback = function() {
    gruntFinished = true;

    if (npmFinished) {
      publishWidget();
    }
  };

  gruntFile(grunt, {
    callback: gruntCallback,
    hasNpmScript
  });

  grunt.tasks(['default']);

  if (hasNpmScript) {
    log('Building source code...');

    buildProcess = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'watch'], { cwd: folderPath });

    let buildFinishedLookup = 'Finished \'build\'';

    buildProcess.stdout.setEncoding('utf8');
    buildProcess.stdout.on('data', function(data) {
      data = data.toString().trim();

      if (!data) {
        return;
      }

      // Uncomment for debugging
      // log(`${'[BUILD]'.green} ${data}`);

      if (npmFinished && data.indexOf('Starting') !== -1) {
        log(`${'[WATCH]'.green} File changes have been detected to the source code.`);
      }

      if (data.indexOf(buildFinishedLookup) !== -1) {
        npmFinished = true;
        buildFinishedLookup = 'Finished';

        if (gruntFinished) {
          publishWidget();
        }
      }
    });

    buildProcess.stderr.setEncoding('utf8');
    buildProcess.stderr.on('data', function(data) {
      error(data.toString());
    });
  }
})();

let enqueuePublishing;
let isPublishing;

function publishWidget() {
  if (isPublishing) {
    enqueuePublishing = true;

    return;
  }

  log(`${'[SYNC]'.yellow} Your changes are being synchronized to Fliplet Studio...`);

  return publish.run(null, {
    logger: log,
    publishingOptions: {
      currentRegionOnly: 'true',
      skipRecompilation: 'true'
    }
  })
    .then(function(response) {
      if (enqueuePublishing) {
        enqueuePublishing = false;

        return publishWidget();
      }

      notifier.notify({
        title: 'Your changes are live on Fliplet Studio',
        message: `${response.widget.name} (${response.widget.version}) is up to date on ${configstore.get('env')}.`,
        icon: path.join(folderPath, 'assets', 'logo.png'),
        sound: false
      });
    })
    .catch(function(error) {
      error(error);
      process.exit();
    });
}
