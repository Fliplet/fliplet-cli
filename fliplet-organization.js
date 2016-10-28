const _ = require('lodash');
const auth = require('./lib/auth');
const organizations = require('./lib/organizations');
const configstore = require('./lib/configstore');

const organizationId = Number(process.argv[2]);
if (!organizationId) {
  console.log('Organization reset');
  return configstore.delete('organization');
}

organizations.getOrganizationsList()
  .then(function (organizations) {
    var organization = _.find(organizations, { id: organizationId });

    if (organization) {
      configstore.set('organization', organization);
      console.log(`Organization set to ${organization.name}`);
      return;
    }

    auth.isAdmin()
      .then(function(isAdmin) {
        if (isAdmin) {
          organization = { id: organizationId };
          configstore.set('organization', organization);
          console.log(`Organization set.`);
          return;
        }

        console.log(`You do not belong to that organization. List organizations you belong with: fliplet list-organizations`);
      })
      .catch(function (error) {
        console.log(error);
      });
  })
  .catch(function onGetOrganizationsError(error) {
    log(error);
  });
