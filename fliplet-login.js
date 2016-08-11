const auth = require('./lib/auth');
const prompt = require('prompt');

console.log('Login...');
prompt.start();
prompt.get([
  'email',
  {
    name: 'password',
    hidden: true }
], function (err, result) {
  auth.login({
    email: result.email,
    password: result.password
  })
    .then(function(login) {
      console.log('Logged in');
      console.log('Auth-token: ', login.auth_token);
    })
    .catch(function (error) {
      console.log(error);
    });
});
