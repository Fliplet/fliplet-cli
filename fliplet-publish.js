const notifier = require('node-notifier');
const path = require('path');

const publish = require('./lib/publish');
const configstore = require('./lib/configstore');

publish.run()
  .then(function (response) {
    console.log(`The package ${response.widget.name} (${response.widget.version}) has been imported`);

    notifier.notify({
      title: `${response.widget.name} has been published`,
      message: `Version ${response.widget.version} of the component is now live on ${configstore.get('env')}.`,
      icon: path.join(__dirname, 'assets', 'logo.png')
    });
  })
  .catch(function (error) {
    console.log(error);
  });
