const path = require('path');
const package = require(path.join(__dirname, 'package.json'));
const prompt = require('prompt');
const program = require('commander');

const auth = require('./lib/auth');


program
  .version(package.version)
  .option('-u, --username <username>', 'Sets the username')
  .option('-p, --password <password>', 'Sets the password')
  .parse(process.argv);

if (program.username && program.password) {
  return login(program.username, program.password);
}

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

  login(result.email, result.password);
});

function login(email, password) {
  auth.login({ email, password })
    .then(function(login) {
      console.log('Logged in successfully. You can now publish widgets.');
    })
    .catch(function (error) {
      console.log(error);
    });
}
