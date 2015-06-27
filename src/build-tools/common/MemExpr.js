export default class MemExpr extends String {
	constructor(base, property) {
		super();
		this.base = base;
		this.property = property;
	}

	get() {
		return `Tget(${this.base}, ${this.property})`;
	}

	set(value) {
		return `Tset(${this.base}, ${this.property}, ${value})`;
	}

	toString() {
		return this.get();
	}

	valueOf() {
		return this.get();
	}
}