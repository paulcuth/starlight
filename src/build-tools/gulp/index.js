
let through = require('through');
let Buffer = require('buffer').Buffer;
let gulp = require('gulp-util');
let parser = require('luaparse');
import { generateJS } from './code-generator';
let fs = require('fs');
// var bootstrap;


// function init() {
	// var code = fs.readFileSync(__dirname + '/bootstrap.js', 'utf8');
	// var data = code.split('/* {{yield}} */');
	// bootstrap = {
	// 	prefix: new Buffer(data[0]),
	// 	suffix: new Buffer(data[1])
	// };
// }

function getAST(file) {
	let content = file.contents.toString('utf8');
	return parser.parse(content);
}

// init();


module.exports = function () {
	let output = [];

	function bufferContents (file) {
		let ast = getAST(file);
		let js = generateJS(ast);
		let buf = new Buffer(`\n/*** Source: ${file.path} ***/\n${js}\n\n`);
		output.push(buf);
	}

	function endStream () {
		let file = new gulp.File();
		file.path = 'starlight-output.js';
		file.contents = Buffer.concat(output);

		this.emit('data', file);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};

