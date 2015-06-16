export default class LuaError extends Error {
	constructor(message) {
		super();
		this.message = message;
	}

	toString() {
		return `LuaError: ${this.message}`;
	}
}
