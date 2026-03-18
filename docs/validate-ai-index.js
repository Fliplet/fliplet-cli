#!/usr/bin/env node

/**
 * Validates that all paths in ai-index.json resolve to actual files.
 * Run: node docs/validate-ai-index.js
 */

const fs = require('fs');
const path = require('path');

const docsDir = path.resolve(__dirname);
const indexPath = path.join(docsDir, 'ai-index.json');

let index;

try {
  index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
} catch (err) {
  console.error('Failed to read ai-index.json:', err.message);
  process.exit(1);
}

let hasErrors = false;

for (const [topic, entry] of Object.entries(index)) {
  const filePath = path.join(docsDir, entry.path);

  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${topic} → ${entry.path}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\nai-index.json validation failed — fix broken paths above.');
  process.exit(1);
}

console.log(`ai-index.json: all ${Object.keys(index).length} paths valid.`);
