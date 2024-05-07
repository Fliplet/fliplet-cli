const _ = require('lodash');

const auth = require('./lib/auth');
const config = require('./lib/config');
const organizations = require('./lib/organizations');


console.log(`
----------------------------------------------------------
------ ${'F L I P L E T   D E V E L O P E R S   C L I'.rainbow} -------
----------------------------------------------------------

Your internet browser should now open up a new tab
to continue the login process.

${'Press Ctrl+C to exit.'.blue}
`);

const port = 9001;
const baseUrl = `http://localhost:${port}`;
const redirectUrl = `${config.api_url}v1/auth/third-party?redirect=${encodeURIComponent(`${baseUrl}/callback`)}&responseType=code&source=CLI&title=Sign%20in%20to%20Authorize%20the%20Fliplet%20CLI`;

require('http').createServer(function(req, res) {
  if (req.url.match(/login/)) {
    res.writeHead(302, {
      'Location': redirectUrl
    });

    return res.end();
  }

  if (req.url.match(/success/)) {
    res.end(`<html><body style="font-size:20px;font-family:sans-serif"><p><strong>You have been logged in successfully to your Fliplet account.</strong></p><p>You may now <a href="javascript:window.close()">close</a> this window now and return to the terminal to continue the process.</p><script>setTimeout(function () { window.close(); }, ${config.env === 'local' ? 0 : 5000});</script></body></html>`);

    return process.exit();
  }

  if (req.url.match(/callback/)) {
    const authToken = _.last(req.url.split('auth_token='));

    auth.setUserForToken(authToken).then(function(user) {
      organizations.getOrganizationsList().then(function onGetOrganizations(organizations) {
        if (!organizations.length) {
          return console.error('Your organization has not been found.');
        }

        if (organizations.length > 1) {
          return console.error('You belong to multiple organizations.');
        }

        const userOrganization = organizations[0];

        config.set('organization', userOrganization);

        console.log('----------------------------------------------------------\r\n');
        console.log(`You have logged in successfully. Welcome back, ${user.fullName.yellow.underline}!`);
        console.log(`Your organization has been set to ${userOrganization.name.green.underline} (#${userOrganization.id}). Your account email is ${user.email.yellow.underline}.`);
        console.log(`You can now develop and publish components via the ${'fliplet run'.bgBlack.red} command!
`);

        res.writeHead(302, {
          'Location': `${baseUrl}/success?${Date.now()}`
        });

        return res.end();
      });
    }).catch(function(err) {
      console.error(err);
      process.exit();
    });
  }
}).listen(9001);

require('openurl').open(`${baseUrl}/login?${Date.now()}`);
