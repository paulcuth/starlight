import { type } from './lib/globals';


const FLOATING_POINT_PATTERN = /^[-+]?[0-9]*\.?([0-9]+([eE][-+]?[0-9]+)?)?$/;
const HEXIDECIMAL_CONSTANT_PATTERN = /^(\-)?0x([0-9a-fA-F]*)\.?([0-9a-fA-F]*)$/;


// Stdout

export const stdout = {
	write(...args) {
		process.stdout.write(args.join('\t'));
	},

	writeln(...args) {
		return this.write(...args, '\n');
	},
};



// Coercion

function throwCoerceError (val, errorMessage) {
	if (!errorMessage) return;
	errorMessage = ('' + errorMessage).replace(/\%type/gi, type(val));
	throw new Error(errorMessage);
}

export function coerceToNumber(val, errorMessage) {
	var n, match, mantissa;

	switch (true) {
		case typeof val == 'number': return val;
		case val === undefined: return;
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

			if (n === undefined) throwCoerceError(val, errorMessage);
			return n;
	}
}
