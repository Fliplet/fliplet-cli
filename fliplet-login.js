const auth = require('./lib/auth');
const prompt = require('prompt');

console.log('Login...');
prompt.start();
prompt.get(['email', 'password'], function (err, result) {
  auth.login({
    email: result.email,
    password: result.password
  })
    .then(function(login) {
      console.log('Logged in');
    });
});
