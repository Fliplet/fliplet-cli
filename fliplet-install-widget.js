const request = require('request');
const configstore = require('./lib/configstore');
const ENV = require('./config/env');
const fs = require('fs');
const archiver = require('archiver');
const temp = require('temp');

var email = configstore.get('email');
var auth_token = configstore.get('auth_token');

if (!email || !auth_token) {
  console.log('You must log in first');
  return;
}

var tempName = temp.path({suffix: '.zip'});
var output = fs.createWriteStream(tempName);
var archive = archiver('zip');

output.on('close', function() {
  console.log('Widget package zipped');
});

archive.on('error', function(err) {
  throw err;
});

archive
  .bulk([
  {
    cwd: './',
    src: ['**/*', '!.git/**', '!.gitignore'],
    expand: true,
    dest: ''
  }
])
  .pipe(output);
archive.finalize();

request({
  method: 'POST',
  url: ENV.api_url + 'v1/widgets?auth_token=' + auth_token,
  formData: {
    my_file: fs.createReadStream(tempName)
  }
}, function (error, response, body) {
  if (error) {
    console.log(error);
  }

  body = JSON.parse(body);

  console.log('The widget ' + body.widget.name + '(' + body.widget.version + ') has been imported');

  // Remove temporary file
  fs.unlinkSync(tempName);
});
