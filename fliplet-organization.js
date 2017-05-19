const _ = require('lodash');
const auth = require('./lib/auth');
const organizations = require('./lib/organizations');
const config = require('./lib/config');

const organizationId = Number(process.argv[2]);

if (!organizationId) {
  console.log('Organization reset');
  return config.set('organization', null);
}

organizations.getOrganizationsList()
  .then(function (organizations) {
    var organization = _.find(organizations, { id: organizationId });

    if (organization) {
      config.set('organization', organization);
      console.log(`Organization set to ${organization.name}`);
      return;
    }

    auth.isAdmin()
      .then(function(isAdmin) {
        if (isAdmin) {
          organization = { id: organizationId };
          config.set('organization', organization);
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
