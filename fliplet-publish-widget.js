const request = require('request');
const configstore = require('./lib/configstore');
const config = require('./lib/config');
const fs = require('fs');
const archiver = require('archiver');
const temp = require('temp');

console.log('Publishing...');

var email = configstore.get('email');
var auth_token = configstore.get('auth_token');

if (!email || !auth_token) {
  console.log('You must log in first');
  return;
}

var tempName = temp.path({suffix: '.zip'});
var output = fs.createWriteStream(tempName);
var archive = archiver('zip');

archive.on('error', function(err) {
  throw err;
});

archive.on('end', function(err) {
  var zip = fs.createReadStream(tempName);

  request({
    method: 'POST',
    url: config.api_url + 'v1/widgets?auth_token=' + auth_token,
    formData: {
      my_file: zip
    }
  }, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    body = JSON.parse(body);

    if ([200, 201].indexOf(response.statusCode) === -1) {
      console.log(body);
    } else {
      console.log('The widget ' + body.widget.name + '(' + body.widget.version + ') has been imported');
    }

    // Remove temporary file
    fs.unlinkSync(tempName);
  });
});

archive.pipe(output);

archive
  .bulk([
    {
      cwd: './',
      src: ['**/*', '!.git/**', '!.gitignore'],
      expand: true,
      dest: ''
    }
  ])
  .finalize();
