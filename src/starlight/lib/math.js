import { default as T } from '../Table';
import { coerceArgToNumber } from '../utils';


const RANDOM_MULTIPLIER = 16807;
const RANDOM_MODULUS = 2147483647;

let randomSeed = 1;


function getRandom () {
	randomSeed = (RANDOM_MULTIPLIER * randomSeed) % RANDOM_MODULUS;
	return randomSeed / RANDOM_MODULUS;
}



export function abs(x) {
	x = coerceArgToNumber(x, 'abs', 1);
	return Math.abs(x);
}


export function acos(x) {
	x = coerceArgToNumber(x, 'acos', 1);
	return Math.acos(x);
}


export function asin(x) {
	x = coerceArgToNumber(x, 'asin', 1);
	return Math.asin(x);
}


export function atan(x) {
	x = coerceArgToNumber(x, 'atan', 1);
	return Math.atan(x);
}


export function atan2(y, x) {
	y = coerceArgToNumber(y, 'atan2', 1);
	x = coerceArgToNumber(x, 'atan2', 2);
	return Math.atan2(y, x);
}


export function ceil(x) {
	x = coerceArgToNumber(x, 'ceil', 1);
	return Math.ceil(x);
}


export function cos(x) {
	x = coerceArgToNumber(x, 'cos', 1);
	return Math.cos(x);
}


export function cosh(x) {
	x = coerceArgToNumber(x, 'cosh', 1);
	return (exp(x) + exp(-x)) / 2;
}


export function deg(x) {
	x = coerceArgToNumber(x, 'deg', 1);
	return x * 180 / Math.PI;
}


export function exp(x) {
	x = coerceArgToNumber(x, 'exp', 1);
	return Math.exp(x);
}


export function floor(x) {
	x = coerceArgToNumber(x, 'floor', 1);
	return Math.floor(x);
}


export function fmod(x, y) {
	x = coerceArgToNumber(x, 'fmod', 1);
	y = coerceArgToNumber(y, 'fmod', 2);
	return x % y;
}


export function frexp(x) {
	x = coerceArgToNumber(x, 'frexp', 1);

	if (x === 0) {
		return [0, 0];
	}

	let delta = x > 0? 1 : -1;
	x *= delta;
	
	let exponent = Math.floor(Math.log(x) / Math.log(2)) + 1;
	let mantissa = x / Math.pow(2, exponent);

	return [mantissa * delta, exponent];
}


export const huge = Infinity;


export function ldexp(m, e) {
	m = coerceArgToNumber(m, 'ldexp', 1);
	e = coerceArgToNumber(e, 'ldexp', 2);
	return m * Math.pow(2, e);
}


export function log(x, base) {
	x = coerceArgToNumber(x, 'log', 1);
	if (base === void 0) {
		return Math.log(x);		
	} else {
		y = coerceArgToNumber(y, 'log', 2);
		return Math.log(x) / Math.log(base);
	}
}


export function log10(x) {
	x = coerceArgToNumber(x, 'log10', 1);
	// v5.2: shine.warn ('math.log10 is deprecated. Use math.log with 10 as its second argument instead.');
	return Math.log(x) / Math.log(10);
}


export function max(...args) {
	return Math.max(...args);
}


export function min(...args) {
	return Math.min(...args);
}


export function modf(x) {
	x = coerceArgToNumber(x, 'modf', 1);
	let intValue = Math.floor(x);
	let mantissa = x - intValue;
	return [intValue, mantissa];
}


export const pi = Math.PI;


export function pow(x, y) {
	x = coerceArgToNumber(x, 'pow', 1);
	y = coercArgToNumber(y, 'pow', 2);
	return Math.pow(x, y);
}


export function rad(x) {
	x = coerceArgToNumber(x, 'rad', 1);
	return (Math.PI / 180) * x;
}


export function random(min, max) {
	if (min === void 0 && max === void 0) return getRandom();
	min = coerceArgToNumber(min, 'random', 1);

	if (max === void 0) {
		max = min;
		min = 1;
	} else {
		max = coerceArgToNumber(max, 'random', 2);
	}
	if (min > max) throw new shine.Error("bad argument #2 to 'random' (interval is empty)");
	return Math.floor(getRandom() * (max - min + 1) + min);
}


export function randomseed(x) {
	x = coerceArgToNumber(x, 'randomseed', 1);
	randomSeed = x;
}


export function sin(x) {
	x = coerceArgToNumber(x, 'sin', 1);
	return Math.sin(x);
}


export function sinh(x) {
	x = coerceArgToNumber(x, 'sinh', 1);
	return (exp(x) - exp(-x)) / 2;
}


export function sqrt(x) {
	x = coerceArgToNumber(x, 'sqrt', 1);
	return Math.sqrt(x);
}


export function tan(x) {
	x = coerceArgToNumber(x, 'tan', 1);
	return Math.tan(x);
}


export function tanh(x) {
	x = coerceArgToNumber(x, 'tanh', 1);
	return (exp(x) - exp(-x))/(exp(x) + exp(-x));
}


export default new T({
	abs,
	acos,
	asin,
	atan,
	atan2,
	ceil,
	cos,
	cosh,
	deg,
	exp,
	floor,
	fmod,
	frexp,
	huge,
	ldexp,
	log,
	log10,
	max,
	min,
	modf,
	pi,
	pow,
	rad,
	random,
	randomseed,
	sin,
	sinh,
	sqrt,
	tan,
	tanh
});
