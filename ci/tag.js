const childProcess = require('child_process');

const PACKAGE_FILENAME = '../package.json';
const package = require(PACKAGE_FILENAME);
const version = 'v' + package.version;

function exec (cmd) {
  const proc = childProcess.exec(cmd);
  proc.stdout.on('data', console.log.bind(console));
  proc.stderr.on('data', console.error.bind(console));
}

exec('git tag ' + version);
exec('git push --tags');
