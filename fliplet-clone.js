const request = require('request');
const prompt = require('prompt');
const unzipper = require('unzipper');
const Spinner = require('cli-spinner').Spinner;

const config = require('./lib/config');

const user = config.data.user || {};
const email = user.email;
const auth_token = user.auth_token;
const widgetId = process.argv[2];

if (!widgetId) {
  console.log('Package name is required');
  process.exit();
}

if (!email || !auth_token) {
  console.error('You must be logged in to perform this action');
  process.exit();
}

request(`${config.api_url}v1/widgets/${widgetId}`, function(error, response, body) {
  if (error) {
    console.error(error);

    return process.exit();
  }

  try {
    body = JSON.parse(body);
  } catch (err) {
    console.error('Error parsing widget JSON data');
    console.error(body);

    return process.exit();
  }

  if (body.error) {
    console.error(body.error);

    return process.exit();
  }

  const widget = body.widget;

  if (!widget) {
    console.error(`Widget not found. Please make sure the package name ${widgetId} is correct and present in the database.`);

    return process.exit();
  }

  if (!widget.sourceUrl) {
    console.error('Source code for this widget is not available');

    return process.exit();
  }

  const widgetName = widget.name.toLowerCase().trim().replace(/ /g, '-').replace(/^com-/, '');

  // eslint-disable-next-line no-nested-ternary
  const prefix = widget.isTheme ? 'theme' : (widget.tags.indexOf('type:menu') !== -1 ? 'menu' : 'widget');
  let folderName = `${prefix}-${widgetName}`;

  console.log(`Cloning widget ${widget.name} (${widget.package}).`);
  console.log('');
  console.log(`Please type the path where this widget should be saved to. Press return to use "${folderName}".`);

  prompt.start();
  prompt.get([
    {
      name: 'folder',
      required: true,
      default: folderName
    }
  ], function(err, result) {
    if (err) {
      console.error(err);
    }

    if (!result) {
      return;
    }

    folderName = result.folder;

    var spinner = new Spinner('Downloading source code %s');

    spinner.setSpinnerString(19);
    spinner.start();

    request(widget.sourceUrl)
      .pipe(unzipper.Extract({ path: folderName }))
      .promise()
      .then(function() {
        spinner.stop(true);
        console.log(`Done! Widget cloned to "${folderName}".`);
      }).catch(function(err) {
        spinner.stop(true);
        console.error(err);
      });
  });
});
