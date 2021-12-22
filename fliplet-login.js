const path = require('path');
const package = require(path.join(__dirname, 'package.json'));
const prompt = require('prompt');
const program = require('commander');

const auth = require('./lib/auth');

program
  .version(package.version)
  .option('-u, --username <username>', 'Sets the username')
  .option('-p, --password <password>', 'Sets the password')
  .option('-c, --code <code>', 'Sets the 2FA code')
  .parse(process.argv);

if (program.username && program.password) {
  return login(program.username, program.password, program.code);
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
], function(err, result) {
  if (!result) {
    return;
  }

  login(result.email, result.password);
});

function login(email, password, twofactor) {
  auth.login({ email, password, twofactor })
    .then(function(login) {
      console.log('Logged in successfully. You can now publish widgets.');
    })
    .catch(function(error) {
      if (error.response && error.response.statusCode && error.response.statusCode === 428) {
        prompt.start();

        return prompt.get([
          {
            name: 'twofactor',
            required: true
          }
        ], function(err, result) {
          if (!result) {
            return;
          }

          login(email, password, result.twofactor);
        });
      }

      console.log('Error:', error.error || error.response && error.response.body);
      process.exit(1);
    });
}
