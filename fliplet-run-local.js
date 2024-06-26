const _ = require('lodash');
const api = require('./lib/api');
const configstore = require('./lib/configstore');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const op = require('openport');
const path = require('path');
const grunt = require('grunt');
const child_process = require('child_process');
const casual = require('casual');
const exec = child_process.exec;
var sass; // optionally required if theme

const gruntFile = require('./lib/gruntfile');

grunt.task.init = function() {};

gruntFile(grunt);

const folderPath = process.cwd();
const widgetPackagePath = path.join(folderPath, 'widget.json');
const translationPackagePath = path.join(folderPath, 'translation.json');
const themePackagePath = path.join(folderPath, 'theme.json');
const menuPackagePath = path.join(folderPath, 'menu.json');
const template = require('./lib/template');

var isTheme;
var isMenu;

var app = express();

var package;
var widgetInstanceData;
var runningPort;

const dummyApp = {
  id: casual.integer(1, 99999),
  name: casual.title
};

const widgetUUID = uuid();

const scriptTagsRegExp = /<script.+src=".+".+>/;
const scriptTagsError = [
  '<h2>Script tags to external files are not allowed</h2>',
  '<p>Script tags to external files cannot be placed in your templates. If you need to use reference some assets, ',
  'please reference them the "assets" array in the widget.json file.</p>'
].join('');

const idTagsRegExp = /<.+ id=".+".+>/;
const idTagsError = [
  '<h2>ID attributes are not allowed</h2>',
  '<p>HTML tags cannot contain the "id" attribute, because it might conflict if your widget ',
  'gets added twice to a page. Please consider using classes instead.</p>'
].join('');

try {
  package = require(widgetPackagePath);
  fs.statSync(widgetPackagePath);
} catch (e) {
  try {
    package = require(themePackagePath);
    fs.statSync(themePackagePath);
    isTheme = true;

    package.templates = _.filter(fs.readdirSync(folderPath), (file) => {
      return /\.html$/.test(file);
    });

    if (!package.templates.length) {
      log('Your theme has no templates.');
      process.exit();
    }

    package.scssVars = {};

    _.forIn(package.settings.defaults || {}, function(val, key) {
      package.scssVars[key] = val;
    });

    (package.settings.configuration || []).forEach(function(section) {
      (section.variables || []).forEach(function(variable) {
        package.scssVars[variable.name] = variable.default;
      });
    });
  } catch (e) {
    try {
      package = require(menuPackagePath);
      fs.statSync(menuPackagePath);
      isMenu = true;
    } catch (e) {
      log('The definition file has not been found (or the JSON syntax is invalid).');
      log('Are you sure you are running this command from a Fliplet component folder?');
      process.exit();
    }
  }
}

// Load packages for themes-only
if (isTheme) {
  sass = require('sass');
}

log();
log('Please note: if you make any change to the package json file, the server needs to be restarted.');
log('Starting up package development server for', package.name, '(' + package.package + ')...');
log();
log();

// --------------------------------------------------------------------------
// Server configuration

app.use(express.static(folderPath, {
  maxage: 0,
  etag: false
}));
app.use(bodyParser.json({ limit: '10MB' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10MB' }));

// --------------------------------------------------------------------------
// AWS configuration

const templateName = isTheme ? 'theme' : 'widget';
const templateHtml = fs.readFileSync(path.join(__dirname, 'assets', `run-${templateName}.html`), 'utf8');
const runWidgetHtml = template.engine.compile(templateHtml);

let runningWidgets = getRunningWidgets();

if (runningWidgets.length) {
  log('Just so you know, these packages are also running on your machine:');
  runningWidgets.forEach((w) => { log(`• ${w.id} -> ${w.data.url}`); });
  log();
  log('If you think this is an error, run "fliplet cleanup" to reset the local state.');
  log();
}

function getTranslations() {
  let file;

  try {
    file = fs.readFileSync(translationPackagePath, { encoding: 'utf8' });
  } catch (err) {
    return undefined;
  }

  try {
    return JSON.parse(file);
  } catch (err) {
    console.error('[Translation] The file is not a valid JSON.', err);
  }
}

// --------------------------------------------------------------------------
// Routes

app.get('/', function(req, res) {
  res.send(runWidgetHtml(package));
});

app.get('/build', function(req, res) {
  var topMenu;
  var page;

  fs.readFile('./build.html', 'utf8', function(err, html) {
    if (err || typeof html !== 'string') {
      return res.send('The build.html file was not found');
    }

    if (html.match(scriptTagsRegExp)) {
      return res.send(scriptTagsError);
    }

    if (html.match(idTagsRegExp)) {
      return res.send(idTagsError);
    }

    if (isMenu) {
      topMenu = {
        id: 'pages',
        canGoBack: casual.boolean,
        title: casual.catch_phrase,
        pages: casual.array_of_digits(casual.integer(1, 20)).map(() => {
          return {
            label: casual.catch_phrase,
            action: JSON.stringify({ action: 'page' })
          };
        })
      };

      page = {
        id: Date.now(),
        dependencies: [],
        html: [
          '<!-- SAMPLE PAGE CONTENT -->',
          `<h2>${casual.title}</h2>`,
          `<h3>${casual.sentences(3)}</h3>`,
          `<p>${casual.description}</p>`,
          `<p>${casual.description}</p>`,
          `<a href="#" class="btn btn-primary">${casual.title}</a>`
        ].join('\r\n')
      };
    }

    const translation = getTranslations();

    template.compile({
      topMenu,
      page,
      app: dummyApp,
      translation,
      widgets: [{
        id: Date.now(),
        name: package.name,
        uuid: widgetUUID,
        html: html,
        htmlTag: package.html_tag,
        dependencies: package.build.dependencies,
        assets: package.build.assets,
        settings: package.settings,
        data: widgetInstanceData,
        tags: package.tags
      }]
    }).then(function(html) {
      res.send(html);
    }, function(err) {
      res.send(err);
    });
  });
});

app.get('/interface', renderInterface);
app.post('/interface', renderInterface);

function renderInterface(req, res) {
  fs.readFile('./interface.html', 'utf8', function(err, html) {
    if (err) {
      console.error(err);
    }

    if (!html) {
      return res.send('The interface.html file was not found');
    }

    if (html.match(scriptTagsRegExp)) {
      return res.send(scriptTagsError);
    }

    const widgets = getRunningWidgets();
    const translation = getTranslations();
    const data = req.query.data || (req.body && req.body.__widgetData);

    if (data) {
      try {
        widgetInstanceData = data ? JSON.parse(data) : req.body;
      } catch (e) {
        console.warn(e);
      }
    }

    widgets.unshift({
      id: req.query.providerId || Date.now(),
      uuid: widgetUUID,
      html: html,
      dependencies: package.interface.dependencies,
      assets: package.interface.assets,
      data: widgetInstanceData
    });

    template.compile({
      development: true,
      interface: true,
      app: dummyApp,
      translation,
      provider: !!req.query.providerId,
      providerId: req.query.providerId,
      providerMode: req.query.providerMode,
      widgets
    }).then(function(html) {
      res.send(html);
    }, function(err) {
      res.status(503).send(err);
    });
  });
}

app.post('/save-widget-data', function(req, res) {
  widgetInstanceData = _.assign({}, widgetInstanceData, req.body);
  res.status(200).send();
});

app.get('/templates/:template', function(req, res) {
  const tpl = fs.readFileSync(path.join(folderPath, req.params.template), 'utf8');

  let assets = [`__scss.css?_=${Date.now()}`].concat(package.assets);

  api.themes.assets({
    inherits: package.settings.inherits || []
  }).then(function(result) {
    assets = _.map(_.reject(result.renderingAssets || {}, (asset) => {
      return /\.scss$/.test(asset.name);
    }), 'url').concat(assets);

    return template.compile({
      widgets: [{
        id: Date.now(),
        html: tpl,
        dependencies: package.dependencies,
        assets: assets.map((a) => {
          return `/${a.replace(/^\//, '')}`;
        })
      }]
    });
  }).then(function(html) {
    res.send(html);
  }, function(err) {
    res.status(503).send(err);
  });
});

app.get('/__scss.css', function(req, res) {
  const files = _.filter(package.assets, (a) => { return /\.scss$/.test(a); });
  let inheritedThemes;

  let scssConfig = [];

  _.forIn(package.scssVars, function(val, key) {
    scssConfig.push(`$${key}: ${val};`);
  });

  scssConfig = scssConfig.join('\r\n');

  return api.themes.compile({
    inherits: package.settings.inherits || [],
    instanceValues: package.scssVars || {}
  }).then(function(result) {
    inheritedThemes = result;
  }).then(function() {
    return Promise.all(files.map(function(file) {
      return new Promise(function(resolve, reject) {
        var fileData = fs.readFileSync(path.join(folderPath, file), 'utf8');

        var dir = file.split('/');

        dir.pop();
        dir = path.join(folderPath, dir.join('/'));

        sass.render({
          data: `${inheritedThemes.vars}\r\n${scssConfig}\r\n${fileData}`,
          outputStyle: 'expanded',
          sourceMap: false,
          includePaths: [dir]
        }, function onSassCompiled(sassError, result) {
          if (sassError) {
            return reject(sassError);
          }

          resolve(`/* ${package.package}:${file} */\r\n${result.css.toString()}`);
        });
      });
    }));
  }).then(function(css) {
    if (inheritedThemes.css) {
      css = [inheritedThemes.css, css.join('\r\n')];
    }

    res.type('text/css');
    res.send(css.join('\r\n'));
  }).catch(function(err) {
    console.error(err);
    res.send(`/* Error compiling scss: ${err} */`);
  });
});

// --------------------------------------------------------------------------
// Startup configuration

op.find({
  startingPort: 3000,
  endingPort: 4000
}, function(err, port) {
  if (err) {
    console.log(err);

    return;
  }

  runningPort = port;

  const host = `http://localhost:${port}`;

  app.listen(port, function() {
    log('[' + package.name + '] development server is up on', host);
    log();

    // mark this widget as running
    const runningPackages = configstore.get('runningPackages') || {};

    runningPackages[package.package] = { url: `http://localhost:${runningPort}` };
    configstore.set('runningPackages', runningPackages);

    if (process.argv.length > 2) {
      return;
    }

    grunt.tasks(['default']);

    setTimeout(function() {
      try {
        exec(['open', host].join(' '));
      } catch (e) {
        // nothing really
      }
    }, 500);
  });
});

['exit', 'SIGINT', 'uncaughtException'].forEach(function(signal) {
  process.on(signal, function() {
    // mark this widget as not running
    const runningPackages = configstore.get('runningPackages') || {};

    delete runningPackages[package.package];
    configstore.set('runningPackages', runningPackages);

    process.exit();
  });
});

function getRunningWidgets() {
  const runningPackages = configstore.get('runningPackages') || {};

  return _.reject(Object.keys(runningPackages), package.package).map(function(packageName) {
    const data = runningPackages[packageName];

    return {
      id: packageName,
      data
    };
  });
}

function log() {
  console.log.apply(this, arguments);
}

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-'
    + s4() + '-' + s4() + s4() + s4();
}
