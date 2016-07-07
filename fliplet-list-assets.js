const assets = require('./lib/assets');

log('Requesting up to date assets list from the server...');

assets.getAssetsList().then(function (assets) {
  log('');

  Object.keys(assets).forEach(function (assetName) {
    var asset = assets[assetName];
    var versions = Object.keys(asset.versions);

    log(`• ${assetName}: ${versions.join(' ')}`);
    log(`  -- category: ${asset.category}`);

    if (asset.dependencies) {
      log(`  -- dependencies: ${asset.dependencies.join(', ')}`);
    }

    log(`  -- includes: ${asset.versions[versions[0]].join(', ')}`);
    log('');
  });
});

function log() {
  console.log.apply(this, arguments);
}