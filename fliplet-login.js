require('colors');

const url = require('url');

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
const callbackUrl = `${baseUrl}/callback`;

// New unified sign-in URL — replaces the legacy /v1/auth/third-party flow.
// The page validates the callback URL against an allow-list (which already
// includes http://localhost:9001/callback) and on success navigates the
// browser to <callback>?token=XXX&user=<base64-json>.
const redirectUrl = `${config.api_url}v1/auth/login`
  + `?return=callback`
  + `&callback=${encodeURIComponent(callbackUrl)}`
  + `&source=CLI`;

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
    // Parse the token (and optional user payload) from the callback URL.
    // The unified contract delivers them as `?token=...&user=<base64>`.
    const parsed = url.parse(req.url, true);
    const authToken = parsed.query.token;

    if (!authToken) {
      console.error('No auth token received from the sign-in flow.');
      res.writeHead(400);
      res.end('Missing token');
      return process.exit(1);
    }

    auth.setUserForToken(authToken).then(function(user) {
      organizations.getOrganizationsList().then(function onGetOrganizations(organizations) {
        if (!organizations.length) {
          console.error('Your organization has not been found.');
          res.writeHead(400);
          res.end('No organizations available for this account.');
          return process.exit(1);
        }

        // For users belonging to multiple organizations, default to the
        // first one. They can switch later via `fliplet organization <id>`
        // (use `fliplet list-organizations` to see all available IDs).
        const userOrganization = organizations[0];

        config.set('organization', userOrganization);

        console.log('----------------------------------------------------------\r\n');
        console.log(`You have logged in successfully. Welcome back, ${user.fullName.yellow.underline}!`);
        console.log(`Your organization has been set to ${userOrganization.name.green.underline} (#${userOrganization.id}). Your account email is ${user.email.yellow.underline}.`);

        if (organizations.length > 1) {
          console.log(`\n${'Note'.yellow}: you belong to ${organizations.length} organizations. To switch, run ${'fliplet list-organizations'.bgBlack.red} to see all of them and ${'fliplet organization <id>'.bgBlack.red} to change.`);
        }

        console.log(`\nYou can now develop and publish components via the ${'fliplet run'.bgBlack.red} command!\n`);

        res.writeHead(302, {
          'Location': `${baseUrl}/success?${Date.now()}`
        });

        return res.end();
      }).catch(function(err) {
        console.error('Failed to fetch organizations:', err);
        res.writeHead(500);
        res.end('Failed to fetch organizations');
        return process.exit(1);
      });
    }).catch(function(err) {
      console.error(err);
      res.writeHead(500);
      res.end('Authentication failed');
      return process.exit(1);
    });
  }
}).listen(9001);

require('openurl').open(`${baseUrl}/login?${Date.now()}`);
