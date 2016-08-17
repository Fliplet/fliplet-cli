const auth = require('./lib/auth');
const prompt = require('prompt');

console.log('Please type your login details');
prompt.start();
prompt.get([
  'email',
  {
    name: 'password',
    hidden: true
  }
], function (err, result) {
  auth.login({
    email: result.email,
    password: result.password
  })
    .then(function(login) {
      console.log('Logged in successfully. You can now publish widgets.');
    })
    .catch(function (error) {
      console.log(error);
    });
});
