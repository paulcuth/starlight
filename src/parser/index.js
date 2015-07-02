import { getRuntimeInit, generateJS } from './code-generator';
import { default as parser } from 'luaparse';

if (typeof global === undefined) {
	global = window;
}

function parse (input) {
	let ast = parser.parse(input);
	let js = getRuntimeInit() + generateJS(ast);
	let babel = global.babel;

	if (babel) {
		return new Function('var global = global || window;' + babel.transform(js).code);
	} else {
		return new Function('var global = global || window;' + js);
	}
}

global.starlight = global.starlight || {};
global.starlight.parser = { parse };
