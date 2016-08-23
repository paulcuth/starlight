export default class MemExpr extends String {
	constructor(base, property, location) {
		super();
		this.base = base;
		this.property = property; //Array.isArray(property) ? property : [property];
		this._location = location;
		this._isGet = true;
	}

	get() {
		this._isGet = true;
	}

	set(value) {
		this._isGet = false;
		this._setValue = value;
	}

	get code() {
		if (this._isGet === undefined) {
			// throw new Error('Member expression direction not set');
		} else if (this._isGet) {
			return ['Tget(', this.base, ', ', ...this.property, ')'];
		} else {
			return ['Tset(', this.base, ', ', ...this.property, ', ', ...this._setValue, ')'];
		}
	}

	get location() {
		return this._location;
	}

}