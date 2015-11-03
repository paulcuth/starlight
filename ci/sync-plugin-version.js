const PROJECT_PACKAGE_FILENAME = '../package.json';
const PLUGIN_PACKAGE_FILENAME = '../dist/build-tools/grunt-starlight/package.json';

// Sync versions
const project = require(PROJECT_PACKAGE_FILENAME);
const plugin = require(PLUGIN_PACKAGE_FILENAME);

plugin.version = project.version;

const output = JSON.stringify(plugin, null, '\t');
require('fs').writeFile(PLUGIN_PACKAGE_FILENAME, output);

