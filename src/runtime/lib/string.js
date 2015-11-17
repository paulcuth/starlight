import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';
import { tostring } from './string';

import { 
	coerceToNumber, 
	coerceToString, 
	coerceToBoolean,
	coerceArgToNumber, 
	coerceArgToString,
	coerceArgToFunction
} from '../utils';


const ROSETTA_STONE = {
	'([^a-zA-Z0-9%(])-': '$1*?',
	'(.)-([^a-zA-Z0-9?])': '$1*?$2',
	'(.)-$': '$1*?',
	'%a': '[a-zA-Z]',
	'%A': '[^a-zA-Z]',
	'%c': '[\x00-\x1f]',
	'%C': '[^\x00-\x1f]',
	'%d': '\\d',
	'%D': '[^\d]',
	'%l': '[a-z]',
	'%L': '[^a-z]',
	'%p': '[\.\,\"\'\?\!\;\:\#\$\%\&\(\)\*\+\-\/\<\>\=\@\[\]\\\^\_\{\}\|\~]',
	'%P': '[^\.\,\"\'\?\!\;\:\#\$\%\&\(\)\*\+\-\/\<\>\=\@\[\]\\\^\_\{\}\|\~]',
	'%s': '[ \\t\\n\\f\\v\\r]',
	'%S': '[^ \t\n\f\v\r]',
	'%u': '[A-Z]',
	'%U': '[^A-Z]',
	'%w': '[a-zA-Z0-9]',
	'%W': '[^a-zA-Z0-9]',
	'%x': '[a-fA-F0-9]',
	'%X': '[^a-fA-F0-9]',
	'%([^a-zA-Z])': '\\$1'
};


function translatePattern (pattern) {
	// TODO Add support for balanced character matching (not sure this is easily achieveable).
	pattern = '' + pattern;

	var n = 0,
		i, l, character, addSlash;
				
	for (i in ROSETTA_STONE) if (ROSETTA_STONE.hasOwnProperty(i)) pattern = pattern.replace(new RegExp(i, 'g'), ROSETTA_STONE[i]);
	l = pattern.length;

	for (i = 0; i < l; i++) {
		character = pattern.substr(i, 1);
		addSlash = false;

		if (character == '[') {
			if (n) addSlash = true;
			n++;

		} else if (character == ']') {
			n--;
			if (n) addSlash = true;
		}

		if (addSlash) {
			pattern = pattern.substr(0, i) + pattern.substr(i++ + 1);
			l++;
		}
	}			

	return pattern;	
}



export function byte(s, i = 1, j) {
	s = coerceArgToString(s, 'byte', 1);
	i = coerceArgToNumber(i, 'byte', 2);
	if (j === void 0) {
		j = i;
	} else {
		j = coerceArgToNumber(j, 'byte', 3);
	}
	
	return s.substring(i - 1, j).split('').map(c => c.charCodeAt(0));
}


export function char(...bytes) {
	return bytes.map((b, i) => {
		b = coerceArgToNumber(b, 'char', i);
		return String.fromCharCode(b);
	}).join('');
}


export function dump(func) {
	func = coerceArgToFunction(func, 'dump', 1);
	throw new LuaError('string.dump() is not supported');
}


export function find(s, pattern, init = 1, plain = false) {
	s = coerceArgToString(s, 'find', 1);
	pattern = coerceArgToString(pattern, 'find', 2);
	init = coerceArgToNumber(init, 'find', 3);
	plain = coerceToBoolean(plain);

	// Regex
	if (!plain) {
		pattern = translatePattern(pattern);
		let reg = new RegExp(pattern);
		let index = s.substr(init - 1).search(reg);
		
		if (index < 0) return;
		
		let match = s.substr(init - 1).match(reg);
		let result = [index + init, index + init + match[0].length - 1];

		match.shift();
		return result.concat(match);
	}
	
	// Plain
	let index = s.indexOf(pattern, init - 1);
	return (index === -1)? void 0 : [index + 1, index + pattern.length];
}


// TODO string.format (formatstring, ···)


export function gmatch(s, pattern) {
	s = coerceArgToString(s, 'gmatch', 1);
	pattern = coerceArgToString(pattern, 'gmatch', 2);
	pattern = translatePattern(pattern);

	let reg = new RegExp(pattern, 'g'),
		matches = s.match(reg);

	return () => {
		let match = matches.shift(),
			groups = new RegExp(pattern).exec(match);

		if (match === void 0) {
			return;
		}

		groups.shift();
		return groups.length? groups : match;
	};				
}


export function gsub(s, pattern, repl, n = Infinity) {
	s = coerceArgToString(s, 'gsub', 1);
	pattern = coerceArgToString(pattern, 'gsub', 2);
	n = coerceArgToNumber(n, 'gsub', 3);

	pattern = translatePattern('' + pattern);
	let replIsFunction = (typeof repl == 'function');

	let count = 0,
		result = '',
		str,
		prefix,
		match,
		lastMatch;

	while (
		count < n 
		&& s 
		&& (match = s.match(pattern))
	) {
		if (replIsFunction) {
			str = repl(match[0]);
			if (str instanceof Array) str = str[0];
			if (str === void 0) str = match[0];

		} else if (repl instanceof T) {
			str = repl.get(match[0]);
			
		} else if (typeof repl == 'object') {
			str = repl[match];
			
		} else {
			str = `${repl}`.replace(/%([0-9])/g, (m, i) => match[i]);
		}

		if (match[0].length === 0 && lastMatch === void 0) {
		 	prefix = '';
		} else {
			prefix = s.split(match[0], 1)[0];
		}

		lastMatch = match[0];
		result += `${prefix}${str}`;
		s = s.substr(`${prefix}${lastMatch}`.length);

		count++;
	}

	return [`${result}${s}`, count];
}


export function len(s) {
	s = coerceArgToString(s, 'len', 1);
	return s.length;
}


export function lower (s) {
	s = coerceArgToString(s, 'lower', 1);
	return s.toLowerCase();
}


export function match(s, pattern, init = 0) {
	s = coerceArgToString(s, 'match', 1);
	pattern = coerceArgToString(pattern, 'match', 2);
	init = coerceArgToNumber(init, 'match', 3);

	s = s.substr(init);
	let matches = s.match(new RegExp(translatePattern (pattern)));
	
	if (!matches) {
		return;
	} else if (!matches[1]) {
		return matches[0];
	}

	matches.shift();
	return matches;
}


export function rep(s, n) {
	s = coerceArgToString(s, 'rep', 1);
	n = coerceArgToNumber(n, 'rep', 2);
	return Array(n + 1).join(s);
}


export function reverse(s) {
	s = coerceArgToString(s, 'reverse', 1);
	return Array.prototype.map.call(s, l => l).reverse().join('');
}


export function sub(s, i = 1, j) {
	s = coerceArgToString(s, 'sub', 1);
	i = coerceArgToNumber(i, 'sub', 2);

	if (j === void 0) {
		s.length;
	} else {
		j = coerceArgToNumber(j, 'sub', 3);
	}

	if (i > 0) {
		i = i - 1;
	} else if (i < 0) {
		i = s.length + i;
	}
	
	if (j < 0) {
		j = s.length + j + 1;
	}

	return s.substring(i, j);
}


export function upper(s) {
	s = coerceArgToString(s, 'upper', 1);
	return s.toUpperCase();
}



export default new T({
	byte, 
	char,
	dump,
	find,
	gmatch,
	gsub,
	len,
	lower,
	match,
	rep,
	reverse,
	sub,
	upper
});
