import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';
import { stdout } from '../utils';


function ipairsIterator(table, index) {
	if (index === undefined) {
		throw new LuaError('Bad argument #2 to ipairs() iterator');
	}

	var nextIndex = index + 1,
		numValues = table.numValues;

	if (!numValues.hasOwnProperty(nextIndex) || numValues[nextIndex] === void 0) return void 0;
	return [nextIndex, numValues[nextIndex]];
}


export function error(message) {
	throw new LuaError(message);	
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
		return [false, e && e.message || e];
	}
	
	if (!(result && result instanceof Array)) {
		result = [result];
	}

	result.unshift(true);
	return result;
}


export function pairs(table) {
	if (!table || !(table instanceof T)) throw new LuaError('Bad argument #1 in pairs(). Table expected');
	return [next, table];
}


export function print(...args) {
	stdout.writeln(...args);
}


export function setmetatable(table, metatable) {
	if (!(table && table instanceof T)) {
		throw new LuaError('Bad argument #1 in setmetatable(). Table expected');
	}

	if (!(metatable === undefined || (metatable && metatable instanceof T))) {
		throw new LuaError('Bad argument #2 in setmetatable(). Nil or table expected');
	}

	let mt;
	if ((mt = table.metatable) && (mt = mt.__metatable)) {
		throw new LuaError('cannot change a protected metatable');
	}

	table.metatable = metatable;
	return table;
}


export function tostring(x) {
	return `${x}`;
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
		result = err(undefined, true);
		success = false;
	}

	if (invalid) throw new LuaError('Attempt to call non-function');
	
	if (!(result && result instanceof Array)) result = [result];
	result.unshift(success);

	return result;
}



export default new T({
	error,
	ipairs,
	next,
	pairs,
	pcall,
	print,
	setmetatable,
	tostring,
	type,
	xpcall,
});
