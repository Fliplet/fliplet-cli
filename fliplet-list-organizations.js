const organizations = require('./lib/organizations');

log('Requesting up to date organizations list from the server...');

organizations.getOrganizationsList()
  .then(function onGetOrganizations(organizations) {
    log('');
    organizations.forEach(function(organization) {
      log(`• ${organization.id}: ${organization.name}`);
      log('');
    });
  })
  .catch(function onGetOrganizationsError(error) {
    log(error);
  });

function log() {
  console.log.apply(this, arguments);
}
