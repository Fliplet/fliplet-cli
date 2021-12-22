const request = require('request');

const config = require('./lib/config');

const user = config.data.user || {};
const email = user.email;
const auth_token = user.auth_token;

if (!email || !auth_token) {
  console.error('You must be logged in to perform this action');
  process.exit();
}

request(`${config.api_url}v1/widgets`, function(error, response, body) {
  if (error) {
    console.error(error);

    return process.exit();
  }

  if (body.error) {
    console.error(body.error);

    return process.exit();
  }

  body = JSON.parse(body);

  console.log('Here\'s the widgets you have access to and can be downloaded:');
  console.log();

  body.widgets.forEach(function(widget) {
    if (widget.sourceUrl) {
      console.log(`• ${widget.name}`);
      console.log(`  - Package name: ${widget.package}`);
      console.log(`  - Version: ${widget.version}`);
      console.log('');
    }
  });

  console.log('');
  console.log('To download a widget, type: fliplet clone <packageName>');
  console.log('');
});
