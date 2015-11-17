import { default as T } from '../Table';
import { default as LuaError } from '../LuaError';
import { 
	coerceToNumber,
	coerceToBoolean,
	coerceArgToNumber,
	coerceArgToString,
	coerceArgToTable,
	coerceArgToFunction
} from '../utils';



export function concat(table, sep = '', i = 1, j) {
	table = coerceArgToTable(table, 'concat', 1);
	sep = coerceArgToString(sep, 'concat', 2);
	i = coerceArgToNumber(i, 'concat', 3);

	if (j === void 0) {
		j = maxn(table);
	} else {
		j = coerceArgToNumber(j, 'concat', 4);
	}

	return [].concat(table.numValues).splice(i, j - i + 1).join(sep);
}


export function getn(table) {
	table = coerceArgToTable(table, 'getn', 1);

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
	if (j > 0 && vals[j] === void 0) {
		/* there is a boundary in the array part: (binary) search for it */
		let i = 0;

		while (j - i > 1) {
			let m = Math.floor((i + j) / 2);

			if (vals[m] === void 0) {
				j = m;
			} else {
				i = m;
			}
		}

		return i;
	}

	return j;
}


export function insert(table, index, obj) {
	table = coerceArgToTable(table, 'insert', 1);

	if (obj === void 0) {
		obj = index;
		index = table.numValues.length;
	} else {
		index = coerceArgToNumber(index, 'insert', 2);
	}

	table.numValues.splice(index, 0, void 0);
	table.set(index, obj);
}


export function maxn(table) {
	table = coerceArgToTable(table, 'maxn', 1);
	return table.numValues.length - 1;
}
		

export function remove(table, index) {
	table = coerceArgToTable(table, 'remove', 1);
	index = coerceArgToNumber(index, 'remove', 2);

	let max = getn(table);
	let vals = table.numValues;

	if (index > max) {
		return;
	}

	if (index === void 0) {
		index = max;
	}
				
	let result = vals.splice(index, 1);
	while (index < max && vals[index] === void 0) {
		delete vals[index++];
	}

	return result;
}


export function sort(table, comp) {
	table = coerceArgToTable(table, 'sort', 1);

	let sortFunc;
	let arr = table.numValues;

	if (comp) {
		comp = coerceArgToFunction(comp, 'sort', 2);
		sortFunc = (a, b) => coerceToBoolean(comp(a, b)[0])? -1 : 1;
	} else {
		sortFunc = (a, b) => a < b? -1 : 1;
	}

	arr.shift();
	arr.sort(sortFunc).unshift(void 0);
}


export default new T({
	concat,
	getn,
	insert,
	maxn,
	remove,
	sort
});
