const fs = require('fs');

const PROJECT_PACKAGE_FILENAME = '../package.json';
const PLUGIN_PACKAGE_FILENAME = '../dist/build-tools/grunt-starlight/package.json';

// Sync versions
fs.readFile(__dirname + '/' + PROJECT_PACKAGE_FILENAME, function (err, project) {
  console.log(''+project);
  project = JSON.parse(project);

  const plugin = require(PLUGIN_PACKAGE_FILENAME);
  plugin.version = project.version;

  const output = JSON.stringify(plugin, null, '\t');
  fs.writeFile(__dirname + '/' + PLUGIN_PACKAGE_FILENAME, output, function (err) {
    if (err) {
      throw(err);
    }

    console.log('Bumped to version: ' + plugin.version);
  });
});
