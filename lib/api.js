const rp = require('request-promise');
const casual = require('casual');
const config = require('./config');
const VERSION = 'v1';

const organization = config.data.organization;


function request(options) {
  const email = config.data.user.email;
  const auth_token = config.data.user.auth_token;
  if (!email || !auth_token) {
    return Promise.reject('You must log in first with: fliplet login');
  }

  if (!organization) {
    return Promise.reject('You must set your organization: fliplet organization');
  }

  options.url = `${config.api_url}${VERSION}/${options.url}`;
  options.timeout = 1000 * 60 * 5; // 5 minutes
  options.headers = { 'Auth-token': auth_token };
  options.json = true;

  return rp(options);
}

const api = {
  app: {
    post(options) {
      options = options || {};
      const body  = {
        organizationId: organization.id,
        name: options.name || casual.word
      };

      options.method = 'POST';
      options.url = 'apps';
      options.body = body;

      return request(options);
    },
    del(id) {
      const options = {
        method: 'DELETE',
        url: `apps/${id}`
      };

      return request(options);
    }
  },
  page: {
    post(options) {
      options = options || {};
      if (!options.appId) {
        return Promise.reject('Requires appId');
      }

      const body  = {
        title: options.title || casual.word
      };

      options.method = 'POST';
      options.url = `apps/${options.appId}/pages`;
      options.body = body;

      return request(options);
    },
    put(options) {
      options = options || {};

      options.method = 'PUT';
      options.url = `apps/${options.appId}/pages/${options.id}`;
      options.body = options;

      return request(options);
    },
    del(options) {
      options = options || {};
      options.method = 'DELETE';
      options.url = `apps/${options.appId}/pages/${options.id}`;

      return request(options);
    }
  },
  widgetInstance: {
    post(options) {
      options = options || {};

      options.method = 'POST';
      options.url = `widget-instances`;
      options.body = options;

      return request(options);
    },
    del(id) {
      const options = {
        method: 'DELETE',
        url: `widget-instances/${id}`
      };

      return request(options);
    }
  },
  widget: {
    del(id) {
      const options = {
        method: 'DELETE',
        url: `widgets/${id}`
      };

      return request(options);
    },
    compileThemes(body) {
      options = {};
      options.method = 'POST';
      options.url = `widgets/compile-themes`;
      options.body = body;

      return request(options);
    }
  }
};

module.exports = api;
