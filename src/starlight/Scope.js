export default class Scope {
	constructor(variables = {}) {
		this._variables = variables;
	}

	get(key) {
		return this._variables[key];
	}

	set(key, value) {
		let vars = this._variables;

		if (this._variables.hasOwnProperty(key) || !this._isExtension) {
			vars[key] = value;
		} else {
			this.__proto__.set(key, value);
		}
	}

	setLocal(key, value) {
		this._variables[key] = value;
	}

	add(key, value) {
		this._variables[key] += value;
	}

	extend(outerScope) {
		let innerVars = Object.create(this._variables);
		let scope = new Scope(innerVars);
		scope.__proto__ = this;
		scope._isExtension = true;
		return scope;
	}
}