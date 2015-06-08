import { default as T } from './Table';
import { coerceToNumber } from './utils';


function binaryArithmetic (left, right, metaMethodName, callback) {
	let mt, f;

	if ((left && left instanceof T && (mt = left.metatable) && (f = mt.get(metaMethodName)))
	|| (right && right instanceof T && (mt = right.metatable) && (f = mt.get(metaMethodName)))) {
		return f.apply(null, [left, right])[0];
	} 

	if (typeof left != 'number') left = coerceToNumber(left, 'attempt to perform arithmetic on a %type value');
	if (typeof right != 'number') right = coerceToNumber(right, 'attempt to perform arithmetic on a %type value');

	return callback(left, right);
}


export default {
	concat(left, right) {
		return `${left}${right}`;
	},

	eq(left, right) {
		return left === right;
	},

	add(left, right) {
		return binaryArithmetic(left, right, '__add', (l, r) => l + r);
	},

	sub(left, right) {
		return binaryArithmetic(left, right, '__sub', (l, r) => l - r);
	},

	mul(left, right) {
		return binaryArithmetic(left, right, '__mul', (l, r) => l * r);
	},

	div(left, right) {
		if (right === undefined) throw new shine.Error('attempt to perform arithmetic on a nil value');
		return binaryArithmetic(left, right, '__div', (l, r) => l / r);
	}
};

