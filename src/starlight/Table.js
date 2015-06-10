

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
			initialiser.call(this);
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
		switch (typeof key) {
			case 'string':
				let value = this.strValues[key];
				if (value !== undefined) {
					return value;
				}
				break;

			case 'number':
				if (key > 0 && key == key >> 0) {
					let value = this.numValues[key];
					if (value !== undefined) {
						return value;
					}
					break;
				}

			default:
				let index = this.keys.indexOf(key);
				if (index >= 0) {
					return this.values[index];
				}
		}
		
		let mt, mm;
		if ((mt = this.metatable) && (mm = mt.__index)) {
			switch (mm.constructor) {
				case Table: return mm.get(key);
				case Function:
					value = mm.call(undefined, this, key);
					return (value instanceof Array)? value[0] : value;
			}
		}

	}


	set(key, value) {
		let typ = typeof key,
			mt = this.metatable,
			positiveIntegerKey = key > 0 && key == key >> 0,
			oldValue;

		switch (typ) {
			case 'string':
				oldValue = this.strValues[key];
				break;

			case 'number':
				if (positiveIntegerKey) {
					oldValue = this.numValues[key];
					break;
				}

			default:
				keys = this.keys;
				index = keys.indexOf(key);
				oldValue = index == -1? undefined : this.values[index];
		}

		// TODO: Refactor the block above into this if statement..
		if (oldValue === undefined && mt && mt.__newindex) {
			switch (mt.__newindex.constructor) {
				case Table: return mt.__newindex.set(key, value);
				case Function: return mt.__newindex(this, key, value);
			}
		}

		switch (typ) {
			case 'string':
				this.strValues[key] = value;
				break;

			case 'number':
				if (positiveIntegerKey) {
					this.numValues[key] = value;
					break;
				}

			default:
				if (index < 0) {
					index = keys.length;
					keys[index] = key;
				}
				
				this.values[index] = value;
		}
	}


};
