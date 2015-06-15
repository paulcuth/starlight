import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';


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
			// pattern = pattern.substr(0, i) + '\\' + pattern.substr(i++);
			pattern = pattern.substr(0, i) + pattern.substr(i++ + 1);
			l++;
		}
	}			

	return pattern;	
}


export function find(s, pattern, init = 1, plain = false) {
	if (typeof s !== 'string' && typeof s !== 'number') throw new LuaError("bad argument #1 to 'find' (string expected, got " + typeof s + ")");
	if (typeof pattern !== 'string' && typeof pattern !== 'number') throw new LuaError("bad argument #2 to 'find' (string expected, got " + typeof pattern + ")");

	s = `${s}`;

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
	return (index === -1)? undefined : [index + 1, index + pattern.length];
}


export default new T({
	find
});
