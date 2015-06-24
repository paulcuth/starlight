
let through = require('through');
let Buffer = require('buffer').Buffer;
let gulp = require('gulp-util');
let parser = require('luaparse');
import { generateJS } from './code-generator';
let fs = require('fs');
let path = require('path');


function getAST(buffer) {
	let content = buffer.toString('utf8');
	return parser.parse(content);
}


function getRuntimeInit() {
	let init = 'let __star = global.starlight.runtime, scope0 = __star.globalScope, scope = scope0, __star_tmp;\n';
	init += 'let __star_call = __star.call, __star_T = __star.T, __star_op_bool = __star.op.bool;';
	init += 'let __star_scope_get = Function.prototype.call.bind(__star.globalScope.constructor.prototype.get);';
	init += 'let __star_scope_set = Function.prototype.call.bind(__star.globalScope.constructor.prototype.set);';
	init += 'let __star_scope_setLocal = Function.prototype.call.bind(__star.globalScope.constructor.prototype.setLocal); ';
	init += 'let __star_op_unm = __star.op.unm, __star_op_not = __star.op.not, __star_op_len = __star.op.len, __star_op_concat = __star.op.concat, __star_op_add = __star.op.add, __star_op_sub = __star.op.sub, __star_op_mul = __star.op.mul, __star_op_div = __star.op.div, __star_op_mod = __star.op.mod, __star_op_eq = __star.op.eq, __star_op_neq = __star.op.neq, __star_op_lt = __star.op.lt, __star_op_gt = __star.op.gt, __star_op_lte = __star.op.lte, __star_op_gte = __star.op.gte, __star_op_pow = __star.op.pow;\n';

	return init;
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

