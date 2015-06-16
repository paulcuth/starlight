import { default as Scope } from './Scope';
import { default as globals } from './lib/globals';
import { default as operators } from './operators';
import { default as Table } from './Table';

export const globalScope = new Scope(globals.strValues);
export const _G = globals;
export const op = operators;
export const T = Table;

export function call(f, ...args) {
	let result = f(...args);
	if (result && result instanceof Array) {
		return result;
	} else {
		return [result];
	}
}


// The following should be configurable

import { default as math } from './lib/math';
_G.set('math', math);

import { default as table } from './lib/table';
_G.set('table', table);

import { default as string } from './lib/string';
_G.set('string', string);

import { default as os } from './lib/os';
_G.set('os', os);
