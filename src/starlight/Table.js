import { default as LuaError } from './LuaError';
import { type } from './lib/globals';


let count = 0;


export default class Table {

	constructor(initialiser) {
		this.index = ++count;
		this.numValues = [undefined];
		this.strValues = {};
		this.keys = [];
		this.values = [];
		this.metatable = null;

		if (!initialiser) {
			// noop
		} else if (typeof initialiser === 'function') {
			initialiser(this);
		} else {
			let isArr = initialiser instanceof Array;

			for (let i in initialiser) {
				if (initialiser.hasOwnProperty(i)) {
					let value = initialiser[i];
					if (value === null) value = undefined;
					let key = isArr? parseInt(i, 10) + 1: i;

					let iterate = (typeof value == 'object' && value.constructor === Object) || value instanceof Array;
					this.set(key, iterate? new Table(value) : value);
				}
			}
		}

	}


	get(key) {
		if (!(this instanceof Table)) {
			if (type(this) == 'userdata') {
				if (key in this) {
					return this[key];
				}
			}
			throw new LuaError(`attempt to index a ${type(this)} value`);
		}

		let value = this.rawget(key);

		if (value === void 0) {
			let mt, mm;
			if (
				(mt = this.metatable) 
				&& (mm = mt.get('__index'))
			) {
				switch (mm.constructor) {
					case Table: return mm.get(key);
					case Function:
						value = mm.call(undefined, this, key);
						return (value instanceof Array)? value[0] : value;
				}
			}
		}

		return value;
	}


	rawget(key) {
		switch (typeof key) {
			case 'string': 	return this.strValues[key];
			case 'number':
				if (key > 0 && key == key >> 0) {
					return this.numValues[key];
				}
				/* fallthrough */
			default:
				let index = this.keys.indexOf(key);
				return (index >= 0) ? this.values[index] : void 0;
		}
	}


	set(key, value) {
		if (!(this instanceof Table)) {
			if (type(this) == 'userdata') {
				this[key] = value;
				return;
			}
			throw new LuaError(`attempt to index a ${type(this)} value`);
		}

		let mt, mm;
		if (
			(mt = this.metatable) 
			&& (mm = mt.get('__newindex'))
		) {
			let oldValue;

			switch (typeof key) {
				case 'string':
					oldValue = this.strValues[key];
					break;

				case 'number':
					let positiveIntegerKey = key > 0 && key == key >> 0;
					if (positiveIntegerKey) {
						oldValue = this.numValues[key];
						break;
					}

				default:
					let keys = this.keys;
					let index = keys.indexOf(key);
					oldValue = index == -1? undefined : this.values[index];
			}

			if (oldValue === undefined) {
				switch (mm.constructor) {
					case Table: return mm.set(key, value);
					case Function: return mm(this, key, value);
				}
			}
		}
		this.rawset(key, value);
	}


	rawset(key, value) {
		switch (typeof key) {
			case 'string':
				this.strValues[key] = value;
				break;

			case 'number':
				let positiveIntegerKey = key > 0 && key == key >> 0;
				if (positiveIntegerKey) {
					this.numValues[key] = value;
					break;
				}

			default:
				let keys = this.keys;
				let index = keys.indexOf(key);
				if (index < 0) {
					index = keys.length;
					keys[index] = key;
				}
				
				this.values[index] = value;
		}
	}


	insert(...values) {
		this.numValues.push(...values);
	}


	toString() {
		let mt, mm;
		if (
			(mt = this.metatable) 
			&& (mm = mt.get('__tostring'))
		) {
			return mm(this)[0];
		} else {
			return 'table: 0x' + this.index.toString(16);
		}
	}
};
