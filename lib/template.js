const Handlebars = require('handlebars');

Handlebars.registerHelper('equals', function (a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

module.exports = Handlebars;