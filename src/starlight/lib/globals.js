import { default as T } from '../Table';
import { stdout } from '../utils';
import { default as LuaError } from '../LuaError';



export function print(...args) {
	stdout.writeln(...args);
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
	print,
	tostring,
	type,
	xpcall,
});
