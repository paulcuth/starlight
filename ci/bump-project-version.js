const PACKAGE_FILENAME = '../package.json';

const package = require(PACKAGE_FILENAME);
const version = package.version.split('.');

version[1]++;
version[2] = 0;
package.version = version.join('.');

const output = JSON.stringify(package, null, '\t');
require('fs').writeFile(PACKAGE_FILENAME, output);
