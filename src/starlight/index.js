import { default as Scope } from './Scope';
import { default as globals } from './lib/globals';
import { default as operators } from './operators';

export const globalScope = new Scope(globals);
export const _G = globals;
export const op = operators;


// The following should be configurable

import { default as math } from './lib/math';
_G.set('math', math);

import { default as table } from './lib/table';
_G.set('table', table);
