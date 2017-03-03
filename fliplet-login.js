const auth = require('./lib/auth');
const prompt = require('prompt');

console.log('Please type your Fliplet Studio login details.');

prompt.start();
prompt.get([
  {
    name: 'email',
    required: true
  },
  {
    name: 'password',
    hidden: true,
    replace: '*',
    required: true
  }
], function (err, result) {
  if (!result) {
    return;
  }

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
