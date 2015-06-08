export default class Table {
	constructor(obj) {
		for (let i in obj) {
			this.set(i, obj[i]);
		}
	}

	get(x) {
		return this[x];
	}

	set(x, y) {
		this[x] = y;
	}
};
