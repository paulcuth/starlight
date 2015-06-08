import {default as Scope} from './Scope';
import {default as globals} from './lib/globals';
import {default as operators} from './operators';

export const globalScope = new Scope(globals);
export const _G = globals;
export const op = operators;
