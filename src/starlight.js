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


