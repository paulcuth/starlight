import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';
import { default as stringLib } from './string';
import { getn } from './table';

import { 
	stdout,
	coerceToNumber, 
	coerceToString, 
	coerceToBoolean,
	coerceArgToNumber, 
	coerceArgToString,
	coerceArgToTable
} from '../utils';


const stringMetatable = new T({ __index: stringLib });
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';



function getPackageMethods() {
	let packageLib = global.starlight.runtime._G.rawget('package');
	if (packageLib === void 0) {
		throw new LuaError('error during require(), package lib not found.');
	}
	let methods = [packageLib.rawget('preload'), packageLib.rawget('loaded')];
	getPackageMethods = ()=>methods;
	return methods;
}


function ipairsIterator(table, index) {
	if (index === void 0) {
		throw new LuaError('Bad argument #2 to ipairs() iterator');
	}

	var nextIndex = index + 1,
		numValues = table.numValues;

	if (!numValues.hasOwnProperty(nextIndex) || numValues[nextIndex] === void 0) return void 0;
	return [nextIndex, numValues[nextIndex]];
}



export const _VERSION = 'Lua 5.1';


export function assert(v, m) {
	if (!coerceToBoolean(v)) {
		m = coerceArgToString(m, 'assert', 2);
		throw new LuaError(m || 'Assertion failed!');
	}
	return [v, m];
}


// TODO dofile([filename])


export function error(message) {
	if (
		typeof message !== 'string' 
		&& typeof message !== 'number'
	) {
		message = '(error object is not a string)';
	}
	throw new LuaError(message);	
}


// TODO getfenv([f])


export function getmetatable(table) {
	if (table && table instanceof T) {
		let mt = table.metatable;
		if (mt) {
			let mm;
			return (mm = mt.rawget('__metatable')) ? mm : mt;
		}
	} else if (typeof table == 'string') {
		return stringMetatable;
	}
}


export function ipairs(t) {
	t = coerceArgToTable(t, 'ipairs', 1);
	return [ipairsIterator, t, 0];
}


// TODO load(func [, chunkname])
// TODO loadfile([filename])


export function loadstring(str, chunkname) {
	str = coerceArgToString(str, 'loadstring', 1);
	let parser = global.starlight.parser;

	if (!parser) {
		throw new Error('Starlight parser not found in call to loadstring(). The parser is required to execute Lua strings at runtime.');
	}

	try {
		return parser.parse(str);
	} catch (e) {
		return [undefined, e.message];
	}
}


export function next(table, index) {
	table = coerceArgToTable(table, 'next', 1);

	// SLOOOOOOOW...
	let found = (index === void 0),
		key, value,
		i, l;

	if (found || (typeof index == 'number' && index > 0 && index == index >> 0)) {
		let numValues = table.numValues;

		if ('keys' in Object) {
			// Use Object.keys, if available.
			let keys = Object['keys'](numValues);
			
			if (found) {
				// First pass
				i = 1;

			} else if (i = keys.indexOf('' + index) + 1) {
				found = true;
			} 

			if (found) {
				while ((key = keys[i]) !== void 0 && (value = numValues[key]) === void 0) i++;
				if (value !== void 0) return [key >>= 0, value];
			}

		} else {
			// Else use for-in (faster than for loop on tables with large holes)

			for (l in numValues) {	
				i = l >> 0;

				if (!found) {
					if (i === index) found = true;
	
				} else if (numValues[i] !== void 0) {
					return [i, numValues[i]];
				}
			}
		}
	}
	
	for (i in table.strValues) {
		if (table.strValues.hasOwnProperty(i)) {
			if (!found) {
				if (i == index) found = true;

			} else if (table.strValues[i] !== void 0) {
				return [i, table.strValues[i]];
			}
		}
	}

	for (i in table.keys) {
		if (table.keys.hasOwnProperty(i)) {
			let key = table.keys[i];

			if (!found) {
				if (key === index) found = true;

			} else if (table.values[i] !== void 0) {
				return [key, table.values[i]];
			}
		}
	}

	return [];
}


export function pairs(table) {
	table = coerceArgToTable(table, 'pairs', 1);
	return [next, table];
}


export function pcall(func, ...args) {
	let result;

	try {			
		if (typeof func == 'function') {
			result = func(...args);
		} else {
			throw new LuaError('Attempt to call non-function');
		}

	} catch (e) {
		return [false, e && e.toString()];
	}
	
	result = [].concat(result);
	return [true, ...result];
}


export function print(...args) {
	let output = args.map(arg => tostring(arg)).join('\t');
	stdout.writeln(output);
}


export function rawequal(v1, v2) {
	return v1 === v2;
}


export function rawget(table, index) {
	table = coerceArgToTable(table, 'rawget', 1);
	return table.rawget(index);
}


export function rawset(table, index, value) {
	table = coerceArgToTable(table, 'rawset', 1);
	if (index === void 0) throw new LuaError('table index is nil');

	table.rawset(index, value);
	return table;
}


export function _require(modname) {
	modname = coerceArgToString(modname, 'require', 1);
	let [preload, loaded] = getPackageMethods();

	let modinit = preload.rawget(modname);
	if (modinit === void 0) {
		throw new LuaError(`module '${modname}' not found:\n\tno field package.preload['${modname}']`);
	}

	let mod = modinit(modname)[0];
	loaded.rawset(modname, mod !== void 0 ? mod : true);

 	return mod;
}


export function select(index, ...args) {	
	if (index === '#') {
		return args.length;
		
	} else if (index = parseInt(index, 10)) {
		return args.slice(index - 1);
		
	} else {
		let typ = type(index);
		throw new LuaError(`bad argument #1 to 'select' (number expected, got ${typ})`);
	}
}


// TODO setfenv(f, table)


export function setmetatable(table, metatable) {
	table = coerceArgToTable(table, 'setmetatable', 1);
	if (metatable !== void 0) {
		metatable = coerceArgToTable(metatable, 'setmetatable', 2);
	}

	let mt;
	if (
		(mt = table.metatable) 
		&& mt.rawget('__metatable')
	) {
		throw new LuaError('cannot change a protected metatable');
	}

	table.metatable = metatable;
	return table;
}


export function tonumber(e, base = 10) {
	base = coerceArgToNumber(base, 'tonumber', 2);

	if (e === '') return;

	if (base < 2 || base > 36) {
		throw new LuaError(`bad argument #2 to 'tonumber' (base out of range)`);
	}

	if (base == 10 && (e === Infinity || e === -Infinity || (typeof e == 'number' && global.isNaN(e)))) {
		return e;
	}

	if (base != 10 && e === void 0) {
		throw new LuaError("bad argument #1 to 'tonumber' (string expected, got nil)");
	}

	e = `${e}`.trim();

	// If using base 10, use normal coercion.
	if (base === 10) {
		return coerceToNumber(e);
	}

	e = coerceToString(e);

	// If using base 16, ingore any "0x" prefix
	let match;
	if (
		base === 16 
		&& (match = e.match(/^(\-)?0[xX](.+)$/))
	) {
		e = `${match[1] || ''}${match[2]}`;
	}

	let pattern = new RegExp('^[' + CHARS.substr(0, base) + ']*$', 'gi');

	if (!pattern.test(e)) return;	// Invalid
	return parseInt(e, base);
}


export function tostring(e) {
	let mt, mm;

	if (
		e !== void 0 
		&& e instanceof T 
		&& (mt = e.metatable) 
		&& (mm = mt.rawget('__tostring'))
	) {
		return mm.call(mm, e);
	}

	if (e instanceof T) {
		return e.toString();
	} else if (e instanceof Function) {
		return e.hasOwnProperty('toString')? `${e}` : 'function: [host code]';
	}

	return coerceToString(e) || 'userdata';
}


export function type(v) {
	let t = typeof v;

	switch (t) {
		case 'undefined': 
			return 'nil';
		
		case 'number': 
		case 'string': 
		case 'boolean': 
		case 'function': 
			return t;
		 
		case 'object': 
			if (v.constructor === T) return 'table';
			if (v && v instanceof Function) return 'function';
		
			return 'userdata';
	}
}


export function unpack(table, i = 1, j) {
	table = coerceArgToTable(table, 'unpack', 1);
	i = coerceArgToNumber(i, 'unpack', 2);

	if (j === void 0) {
		j = getn(table);
	} else {
		j = coerceArgToNumber(j, 'unpack', 3);
	}
	
	return table.numValues.slice(i, j + 1);
}


export function xpcall(func, err) {
	let result, success, invalid;
		
	try {
		if (typeof func === 'function') {
			result = func();
		} else {
			invalid = true;
		}
		success = true;
		
	} catch (e) {
		result = err(void 0, true)[0];
		success = false;
	}

	if (invalid) throw new LuaError('Attempt to call non-function');
	
	if (!(result && result instanceof Array)) result = [result];
	result.unshift(success);

	return result;
}



export const _G = new T({
	_VERSION,
	assert,
	error,
	getmetatable,
	ipairs,
	loadstring,
	next,
	pairs,
	pcall,
	print,
	rawequal,
	rawget,
	rawset,
	require: _require,
	select,
	setmetatable,
	tonumber,
	tostring,
	type,
	unpack,
	xpcall,
});


_G.rawset('_G', _G);
export default _G;