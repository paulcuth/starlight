import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';
import { stdout, coerceToNumber, coerceToString } from '../utils';
import { default as stringLib } from './string';
import { getn } from './table';


const stringMetatable = new T({ __index: stringLib });
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';


function ipairsIterator(table, index) {
	if (index === undefined) {
		throw new LuaError('Bad argument #2 to ipairs() iterator');
	}

	var nextIndex = index + 1,
		numValues = table.numValues;

	if (!numValues.hasOwnProperty(nextIndex) || numValues[nextIndex] === void 0) return void 0;
	return [nextIndex, numValues[nextIndex]];
}



export const _VERSION = 'Lua 5.1';


export function assert(v, m) {
	if (v === false || v === void 0) {
		throw new LuaError(m || 'Assertion failed!');
	}
	return [v, m];
}


export function error(message) {
	throw new LuaError(message);	
}


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


export function ipairs(table) {
	if (!(table && table instanceof T)) throw new LuaError('Bad argument #1 in ipairs(). Table expected');
	return [ipairsIterator, table, 0];
}


export function next(table, index) {
	// SLOOOOOOOW...
	let found = (index === undefined),
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
	
				} else if (numValues[i] !== undefined) {
					return [i, numValues[i]];
				}
			}
		}
	}
	
	for (i in table.strValues) {
		if (table.strValues.hasOwnProperty(i)) {
			if (!found) {
				if (i == index) found = true;

			} else if (table.strValues[i] !== undefined) {
				return [i, table.strValues[i]];
			}
		}
	}

	for (i in table.keys) {
		if (table.keys.hasOwnProperty(i)) {
			let key = table.keys[i];

			if (!found) {
				if (key === index) found = true;

			} else if (table.values[i] !== undefined) {
				return [key, table.values[i]];
			}
		}
	}

	return [];
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


export function pairs(table) {
	if (!table || !(table instanceof T)) throw new LuaError('Bad argument #1 in pairs(). Table expected');
	return [next, table];
}


export function print(...args) {
	stdout.writeln(...args);
}


export function rawset(table, index, value) {
	if (!(table instanceof T)) throw new LuaError('Bad argument #1 in rawset(). Table expected');
	if (index === undefined) throw new LuaError('Bad argument #2 in rawset(). Nil not allowed');

	table.rawset(index, value);
	return table;
}


export function select(index, ...args) {	
	if (index === '#') {
		return args.length;
		
	} else if (index = parseInt(index, 10)) {
		return args.slice(index - 1);
		
	} else {
		throw new LuaError('bad argument #1 in select(). Number or "#" expected');
	}
}


export function setmetatable(table, metatable) {
	if (!(table && table instanceof T)) {
		throw new LuaError('Bad argument #1 in setmetatable(). Table expected');
	}

	if (!(metatable === undefined || (metatable && metatable instanceof T))) {
		throw new LuaError('Bad argument #2 in setmetatable(). Nil or table expected');
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
	if (e === '') return;

	if (base < 2 || base > 36) {
		throw new LuaError('bad argument #2 to tonumber() (base out of range)');
	}

	if (base == 10 && (e === Infinity || e === -Infinity || (typeof e == 'number' && global.isNaN(e)))) {
		return e;
	}

	if (base != 10 && e == undefined) {
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
		e !== undefined 
		&& e instanceof T 
		&& (mt = e.metatable) 
		&& (mm = mt.rawget('__tostring'))
	) {
		return mm.call(mm, e);
	}

	if (
		e 
		&& (e instanceof T || e instanceof Function)
	) {
		return e.toString();
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
	if (!(table instanceof T)) {
		throw new LuaError("Bad argument #1 to 'unpack' (table expected)");
	} 

	if (j === undefined) {
		j = getn(table);
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
		result = err(undefined, true)[0];
		success = false;
	}

	if (invalid) throw new LuaError('Attempt to call non-function');
	
	if (!(result && result instanceof Array)) result = [result];
	result.unshift(success);

	return result;
}



export default new T({
	_VERSION,
	assert,
	error,
	getmetatable,
	ipairs,
	next,
	pairs,
	pcall,
	print,
	rawset,
	select,
	setmetatable,
	tonumber,
	tostring,
	type,
	unpack,
	xpcall,
});
