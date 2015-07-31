import { getRuntimeInit, generateJS } from './code-generator';
import { default as parser } from 'luaparse';

if (typeof global === undefined) {
	global = window;
}


function parseToString (input) {
	let ast = parser.parse(input);
	let js = getRuntimeInit() + generateJS(ast);
	let babel = global.babel;
	
	js = `()=>{ ${js} }`;
	if (babel) {
		js = babel.transform(js).code;
		js = js.replace(/^'use strict';\s*/, '').replace(/;$/, '');
	}

	return js;
}


function parse (input) {
	return (new Function(`var global = this; return(${parseToString(input)}).apply(this, arguments);`)).bind(global||window);
}


global.starlight = global.starlight || {};
global.starlight.parser = { parse, parseToString };
