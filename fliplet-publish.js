const publish = require('./lib/publish');
publish.run()
  .then(function (response) {
    console.log(`The package ${response.widget.name} (${response.widget.version}) has been imported`);
  })
  .catch(function (error) {
    console.log(error);
  });
