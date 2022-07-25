console.log('Disabled');
process.exit();

require('dotenv').config();

const algoliasearch = require('algoliasearch');

// You need an API key with `deleteIndex` permissions
const client = algoliasearch(process.env.APPLICATION_ID, process.env.API_KEY);

const index = client.initIndex('Fliplet Developers');

index.clearObjects();

console.log('Cleared index');
