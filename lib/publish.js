const _ = require('lodash');
const rp = require('request-promise');
const fs = require('fs');
const archiver = require('archiver');
const temp = require('temp');

const config = require('./config');

function getUser() {
  const user = config.get('user');

  return user && user.auth_token
    ? user
    : false;
}

function publish(user, opts = {}) {
  const log = opts.logger || console.log;

  user = user || config.data.user || {};

  const auth_token = user.auth_token;
  const organization = config.data.organization;

  if (!auth_token) {
    return Promise.reject('You must log in first with: fliplet login');
  }

  log('[BUNDLE] Packaging up source code');

  const tempName = temp.path({ suffix: '.zip' });
  const output = fs.createWriteStream(tempName);
  const archive = archiver('zip');

  return new Promise(function(resolve, reject) {
    archive.on('error', function(err) {
      reject(err);
    });

    output.on('error', function(err) {
      reject(err);
    });

    // Wait for the output stream to fully close before reading the file
    // This prevents EPERM errors on Windows where the file may still be locked
    output.on('close', function() {
      const zip = fs.createReadStream(tempName);

      const formData = {
        my_file: zip,
        recompile: 'false'
      };

      if (opts.publishingOptions) {
        _.extend(formData, opts.publishingOptions);
      }

      if (organization) {
        formData.organizationId = organization.id;
      }

      const options = {
        method: 'POST',
        json: true,
        url: config.api_url + 'v1/widgets?auth_token=' + auth_token,
        formData: formData,
        timeout: 1000 * 60 * 5 // 5 minutes
      };

      log('[BUNDLE] Uploading archive');

      rp(options)
        .then(function(response) {
          // Clean up temporary file after successful upload
          try {
            fs.unlinkSync(tempName);
          } catch (cleanupError) {
            // Ignore cleanup errors, file might already be deleted
          }

          log(`${'[SYNC]'.green} The component has been sync for ${user.fullName} (${organization && organization.name || 'organization not set'}) on ${config.env.cyan.underline}.`);

          resolve(response);
        })
        .catch(function(result) {
          // Clean up temporary file after failed upload
          try {
            fs.unlinkSync(tempName);
          } catch (cleanupError) {
            // Ignore cleanup errors, file might already be deleted
          }

          const error = result.error && result.error.error;

          if (error === 'organizationId is not set') {
            return reject('You must set an organization you belong to with: fliplet organization <id>');
          }

          reject(error || result);
        });
    });

    archive.pipe(output);

    archive.glob('**/*', {
      cwd: './',
      ignore: ['.git/**', '.gitignore', 'node_modules/**']
    }, {});

    archive.finalize();
  });
}

module.exports.run = publish;
module.exports.getUser = getUser;
