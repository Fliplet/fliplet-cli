const auth = require('./lib/auth');

log('Logout...');

auth.logout()
  .then(function() {
    log('');
    log('Logged out');
  });

function log() {
  console.log.apply(this, arguments);
}
