export const stdout = {
	write(...args) {
		process.stdout.write(args.join('\t'));
	},

	writeln(...args) {
		return this.write(...args, '\n');
	},
};

export const op = {
	concat(left, right) {
		return `${left}${right}`;
	},

	eq(left, right) {
		return left === right;
	},

	add(left, right) {
		return left + right;
	}
};

export class T {
	constructor(obj) {
		for (let i in obj) {
			this.set(i, obj[i]);
		}
		console.log('{new table created}');
	}

	get(x) {
		return this[x];
	}

	set(x, y) {
		this[x] = y;
	}
};

export const _G = new T({
	print(...args) {
		stdout.writeln(...args);
	},

	tostring(x) {
		return `${x}`;
	}
});

class Scope {
	constructor(variables = {}) {
		this._variables = variables;
	}

	get(key) {
		return this._variables[key];
	}

	set(key, value) {
		this._variables[key] = value;
	}

	add(key, value) {
		this._variables[key] += value;
	}

	extend(outerScope) {
		let innerVars = Object.create(this._variables);
		return new Scope(innerVars);
	}
}

export const globalScope = new Scope(_G);
