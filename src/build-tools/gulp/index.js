
let through = require('through');
let Buffer = require('buffer').Buffer;
let gulp = require('gulp-util');
let parser = require('luaparse');
import { getRuntimeInit, generateJS } from './code-generator';
let fs = require('fs');
let path = require('path');


function getAST(buffer) {
	let content = buffer.toString('utf8');
	return parser.parse(content);
}


module.exports = function (options = {}) {
	let mainFilename = options.main;
	let basePath = options.basePath || '';
	let output = [];
	let fileCount = 0;
	let firstFilename;

	function bufferContents (file) {
		let content = file.contents.toString('utf8');

		let modpath = path.relative(basePath, file.path);
		modpath = modpath.replace(/\//g, '.').replace(/\.lua$/, '');

		if (!fileCount++) {
			firstFilename = modpath;
		}

		let buf = new Buffer(`\nrawset(package.preload, '${modpath}', function(...) ${content} end)\n`);
		output.push(buf);
	}

	function endStream () {
		if (mainFilename) {
			mainFilename = mainFilename.replace(/\//g, '.').replace(/\.lua$/, '');
		} else {
			mainFilename = firstFilename;
			if (fileCount > 1) {
				console.log(`No main file specified, using '${mainFilename}'.`);
				console.log("To specify the entry point, pass a config object to gulp-starlight with a 'main' property.");
			}
		}
		let file = new gulp.File();
		let runtimeInit = new Buffer(getRuntimeInit());
		let start = new Buffer(`require'${mainFilename}'\n`);

		let ast = getAST(Buffer.concat([].concat(output, start)));
		let js = generateJS(ast);

		file.path = 'starlight-output.js';
		file.contents = Buffer.concat([runtimeInit, new Buffer(js)]);

		this.emit('data', file);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};

