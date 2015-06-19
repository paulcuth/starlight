import { type } from './lib/globals';
import { default as LuaError } from './LuaError';
import { default as T } from './Table';


/**
 * Pattern to identify a float string value that can validly be converted to a number in Lua.
 * @type RegExp
 * @constant
 */
const FLOATING_POINT_PATTERN = /^[-+]?[0-9]*\.?([0-9]+([eE][-+]?[0-9]+)?)?$/;


/**
 * Pattern to identify a hex string value that can validly be converted to a number in Lua.
 * @type RegExp
 * @constant
 */
const HEXIDECIMAL_CONSTANT_PATTERN = /^(\-)?0x([0-9a-fA-F]*)\.?([0-9a-fA-F]*)$/;



/********************
 * Stdout
 ********************/

export const stdout = {
	write(...args) {
		process.stdout.write(args.join('\t'));
	},

	writeln(...args) {
		return this.write(...args, '\n');
	},
};



/********************
 * Coercion
 ********************/

/**
 * Thows an error with the type of a variable included in the message
 * @param {Object} val The value whise type is to be inspected.
 * @param {String} errorMessage The error message to throw.
 * @throws {LuaError}
 */
function throwCoerceError (val, errorMessage) {
	if (!errorMessage) return;
	errorMessage = ('' + errorMessage).replace(/\%type/gi, type(val));
	throw new LuaError(errorMessage);
}


/**
 * Coerces a value from its current type to a boolean in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @returns {Boolean} The converted value.
 */
export function coerceToBoolean(val) {
	return !(val === false || val === void 0);
}


/**
 * Coerces a value from its current type to a number in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @param {String} [errorMessage] The error message to throw if the conversion fails.
 * @returns {Number} The converted value.
 */
export function coerceToNumber(val, errorMessage) {
	let n, match, mantissa;

	switch (true) {
		case typeof val == 'number': return val;
		case val === void 0: return;
		case val === 'inf': return Infinity;
		case val === '-inf': return -Infinity;
		case val === 'nan': return NaN;

		default:
			if (('' + val).match(FLOATING_POINT_PATTERN)) {
				n = parseFloat(val);

			} else if (match = ('' + val).match(HEXIDECIMAL_CONSTANT_PATTERN)) {
				mantissa = match[3];

				if ((n = match[2]) || mantissa) {
					n = parseInt(n, 16) || 0;
					if (mantissa) n += parseInt(mantissa, 16) / Math.pow(16, mantissa.length);
					if (match[1]) n *= -1;
				}
			}

			if (n === void 0) {
				throwCoerceError(val, errorMessage);
			}

			return n;
	}
}


/**
 * Coerces a value from its current type to a string in the same manner as Lua.
 * @param {Object} val The value to be converted.
 * @param {String} [errorMessage] The error message to throw if the conversion fails.
 * @returns {String} The converted value.
 */
export function coerceToString(val, errorMessage) {
	switch(true) {
		case typeof val == 'string': 
			return val;

		case val === void 0:
		case val === null: 
			return 'nil';
		
		case val === Infinity: 
			return 'inf';

		case val === -Infinity: 
			return '-inf';

		case typeof val == 'number': 
		case typeof val == 'boolean': 
			return global.isNaN(val)? 'nan' : `${val}`;

		default: 
			return throwCoerceError(val, errorMessage) || '';
	}
}



function coerceArg(value, coerceFunc, typ, funcName, index) {
	return coerceFunc(value, `bad argument #${index} to '${funcName}' (${typ} expected, got %type)`);
}

export function coerceArgToNumber(value, funcName, index) {
	return coerceArg(value, coerceToNumber, 'number', funcName, index);
}

export function coerceArgToString(value, funcName, index) {
	return coerceArg(value, coerceToString, 'string', funcName, index);
}

export function coerceArgToTable(value, funcName, index) {
	if (value instanceof T) {
		return value;
	} else {
		let typ = type(value);
		throw new LuaError(`bad argument #${index} to '${funcName}' (table expected, got ${typ})`);
	}
}

export function coerceArgToFunction(value, funcName, index) {
	if (value instanceof Function) {
		return value;
	} else {
		let typ = type(value);
		throw new LuaError(`bad argument #${index} to '${funcName}' (function expected, got ${typ})`);
	}
}



