import { getRuntimeInit, generateJS } from './code-generator';
import { default as parser } from 'luaparse';
import superagent from 'superagent';


if (typeof global === undefined) {
	global = window;
}

const SUPPORTED_MIME_TYPES = [
	'text/lua',
	'text/x-lua',
	'application/lua',
	'application/x-lua',
];

function parseToString (input) {
	let ast = parser.parse(input);
	let js = getRuntimeInit() + generateJS(ast);
	let babel = global.babel;

	if (babel) {
		js = `()=>{${js}}`;
		js = babel.transform(js).code;
		js = js.substr(14, js.length - 15);
		js = js.replace('\n(function','\nreturn (function') + '.apply(void 0, arguments);';
	}

	return js;
}


function parse (input) {
	return (new Function('var global = this;' + parseToString(input))).bind(global || window);
}


function runScriptTags() {
	const selectors = SUPPORTED_MIME_TYPES.map(t => `script[type="${t}"]`);
	const scriptTags = [...document.querySelectorAll(selectors.join())];
	let script, i, modname, scriptBody;
	let lua = '';

	const { immediate, deferred } = parseScriptTags(scriptTags);
	runNextTag([...immediate, ...deferred]);
}


function parseScriptTags (tags) {
	const immediate = [];
	const deferred = [];

	tags.forEach(tag => {
		const src = tag.src;

		if (src) {
			const arr = tag.defer? deferred : immediate;
			arr.push(new Promise((resolve, reject) => {
				let x = superagent
					.get(src)
					.end((error, response) => {
		        if (error) {
		          resolve({});

		        } else {
		          resolve({
								modname: tag.dataset.modname,
								body: response.text
							});
		        }
		      });
			}));

		} else {
			immediate.push(Promise.resolve({
				modname: tag.dataset.modname,
				body: tag.textContent,
			}));
		}
	});

	return { immediate, deferred };
}


function runNextTag (tags) {
	if (!tags.length) {
		return;
	}

	let tag;
	[tag, ...tags] = tags;

	tag.then(({ modname, body, error }) => {
		if (body !== undefined) {
			if (modname) {
				body = " rawset(package.preload, '" + modname + "', function(...) " + body + " end) ";
			}
			parse(body)();		
		}

		runNextTag(tags);
	});
}


// Init
if (global.document && global.document.querySelector('script[src$="starlight.js"][data-run-script-tags]')) {
	global.document.addEventListener('DOMContentLoaded', runScriptTags);
}

global.starlight = global.starlight || {};
global.starlight.parser = { 
	parse,
	parseToString,
	runScriptTags
};
