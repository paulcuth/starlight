const PROJECT_PACKAGE_FILENAME = '../package.json';
const PLUGIN_PACKAGE_FILENAME = '../dist/build-tools/grunt-starlight/package.json';

// Sync versions
const project = require(PROJECT_PACKAGE_FILENAME);
const plugin = require(PLUGIN_PACKAGE_FILENAME);
console.log(project);
plugin.version = project.version;

const output = JSON.stringify(plugin, null, '\t');
require('fs').writeFile(__dirname + '/' + PLUGIN_PACKAGE_FILENAME, output, function (err) {
  if (err) {
    throw(err);
  }

  console.log('Bumped to version: ' + plugin.version);
});
