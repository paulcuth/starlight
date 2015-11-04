const PACKAGE_FILENAME = '../package.json';

const package = require(PACKAGE_FILENAME);
const oldVersion = package.version;
const version = oldVersion.split('.');

function exec (cmd) {
  const proc = childProcess.exec(cmd);
  proc.stdout.on('data', console.log.bind(console));
  proc.stderr.on('data', console.error.bind(console));
}

if (!package.ci) {
  version[2]++;

} else {
  if (package.ci.bump == 'major') {
    version[0]++;
    version[1] = version[2] = 0;
  } else if (package.ci.bump = 'minor') {
    version[1]++;
    version[2] = 0;
  } else {
    version[2]++;
  }

  delete package.ci;
}

package.version = version.join('.');
const output = JSON.stringify(package, null, '\t');

require('fs').writeFile(__dirname + '/' + PACKAGE_FILENAME, output, function (err) {
  if (err) {
    throw(err);
  }

  exec('git add ./package.json');
  exec('git commit -m "Bumps version to ' + package.version + '"');
  exec('git push');

  console.log('Bumped version: ' + oldVersion + ' -> ' + package.version);
});
