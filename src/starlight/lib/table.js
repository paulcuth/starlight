import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';


export function getn(table) {
	if (!(table && table instanceof T)) {
		throw new LuaError("Bad argument #1 in 'getn' (table expected)");
	}

	let vals = table.numValues, 
		keys = [],
		j = 0;

	for (let i in vals) {
		if (vals.hasOwnProperty(i)) {
			keys[i] = true;
		}
	}

	while (keys[j + 1]) j++;

	// Following translated from ltable.c (http://www.lua.org/source/5.1/ltable.c.html)
	if (j > 0 && vals[j] === undefined) {
		/* there is a boundary in the array part: (binary) search for it */
		let i = 0;

		while (j - i > 1) {
			let m = Math.floor((i + j) / 2);

			if (vals[m] === undefined) {
				j = m;
			} else {
				i = m;
			}
		}

		return i;
	}

	return j;
}


export default new T({
	getn
});
