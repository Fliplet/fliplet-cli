const rp = require('request-promise');
const fs = require('fs');
const Spinner = require('cli-spinner').Spinner;
const archiver = require('archiver');
const temp = require('temp');

const config = require('./config');

function publish() {
  var user = config.data.user || {};
  var email = user.email;
  var auth_token = user.auth_token;
  var organization = config.data.organization;

  if (!email || !auth_token) {
    return Promise.reject('You must log in first with: fliplet login');
  }

  var spinner = new Spinner('Checking login %s');

  spinner.setSpinnerString(19);
  spinner.start();

  console.log(`Publishing as ${email} on ${config.env} environment.`);

  if (organization) {
    console.log(`Organization set as ${organization.name}.`);
  }

  spinner.setSpinnerTitle('Creating archive');

  var tempName = temp.path({ suffix: '.zip' });
  var output = fs.createWriteStream(tempName);
  var archive = archiver('zip');

  return new Promise(function(resolve, reject) {
    archive.on('error', function(err) {
      throw err;
    });

    archive.on('end', function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      var zip = fs.createReadStream(tempName);

      var formData = {
        my_file: zip
      };

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

      spinner.setSpinnerTitle('Uploading package');

      // Remove temporary file
      fs.unlinkSync(tempName);

      return rp(options)
        .then(function(response) {
          spinner.stop(true);
          resolve(response);
        })
        .catch(function(result) {
          spinner.stop(true);

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
