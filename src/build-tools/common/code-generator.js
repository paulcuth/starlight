var Symbol = Symbol || { iterator: function () {} }; // Needed to get Babel to work in Node 

const UNI_OP_MAP = {
	'-': '-',
	'not': '!'
};

const BIN_OP_MAP = {
	'..': 'concat',
	'+': 'add', 
	'-': 'sub', 
	'*': 'mul', 
	'/': 'div',
	'%': 'mod',
	'==': 'eq',
	'~=': 'neq'
};

const LOGICAL_OP_MAP = {
	'and': '&&',
	'or': '||'
};


const GENERATORS = {

	// AssignmentStatement(node, scope) {
	// 	let assignments = [];
	// 	node.variables.forEach((variable, index) => {
	// 		let name = generate(variable, scope);
	// 		let value = generate(node.init[index], scope);
	// 		let match = name.match(/^(.*)\.get\('([^.]+)'\)$/);
	// 		// let match = name.match(/^([^.]+)\.((.*)\.)?get\('([^.]+)'\)$/);

	// 		if (match) {
	// 			let [_, subject, property] = match;
	// 			// let [_, subject, _, path, property] = match;
	// 			assignments.push(`${subject}.set('${property}', ${value})`);
	// 			// assignments.push(`${subject}.set('${property}', ${value})`);

	// 		} else {
	// 			assignments.push(`${name}=${value}`);
	// 		}
	// 	});
	// 	return assignments.join(';\n');
	// },


	BinaryExpression(node, scope) {
		let left = getIdentifierInScope(node.left, scope);
		let right = getIdentifierInScope(node.right, scope);
		let operator = BIN_OP_MAP[node.operator];

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled binary operator: ${node.operator}`);
		}

		return `__star.op.${operator}(${left}, ${right})`;
	},


	CallStatement(node, scope) {
		return generate(node.expression, scope);
	},


	CallExpression(node, scope) {
		let functionName = generate(node.base, scope);
		let args = node.arguments.map((arg) => generate(arg, scope)).join(', ');
		return `scope.get('${functionName}')(${args})`;
	},


	Chunk(node, scope) {
		let output = node.body.map(statement => generate(statement, scope) + ';');
		return output.join('\n');
	},


	// DoStatement(node, outerScope) {
	// 	let { scope, scopeDef } = extendScope(outerScope);
	// 	let body = this.Chunk(node, scope);
	// 	return `(function() {\n${scopeDef}\n${body}\n})()`;
	// },


	// ElseClause(node, scope) {
	// 	let body = this.Chunk(node, scope);
	// 	return `{${body}}`;
	// },


	ForNumericStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let variableName = generate(node.variable, outerScope);
		let start = generate(node.start, outerScope);
		let end = generate(node.end, outerScope);
		let step = node.step === null ? 1 : generate(node.step, outerScope);
		let operator = start < end ? '<=' : '>=';
		let body = this.Chunk(node, scope);

		let defs = scopeDef.split(', ');
		let init = `scope${scope}.set('${variableName}', ${start})`;
		let cond = `scope${scope}.get('${variableName}') ${operator} ${end}`;
		let after = `scope${scope}.add('${variableName}', ${step})`;
		return `${defs[0]};\nfor (${init}; ${cond}; ${after}) {\nlet ${defs[1]}\n${body}\n}`;
	},


	// FunctionDeclaration(node, outerScope) {
	// 	let { scope, scopeDef } = extendScope(outerScope);
	// 	let parameters = node.parameters.map((param) => generate(param, scope, { initialising: true })).join();
	// 	let body = this.Chunk(node, scope);
	// 	let funcScope;

	// 	if (node.isLocal) {
	// 		funcScope = outerScope;
	// 	} else {
	// 		// Get global
	// 		funcScope = outerScope;
	// 		while (funcScope.__proto__ !== Object.prototype) { // Ugly
	// 			funcScope = funcScope.__proto__;
	// 		}
	// 	}

	// 	let identifier = generate(node.identifier, funcScope, { initialising: true });
	// 	let funcDef = `function ${identifier}(${parameters}){${scopeDef}\n${body}}`;

	// 	if (node.isLocal) {
	// 		return `let ${identifier} = ${funcDef}`;
	// 	} else {
	// 		funcScope[identifier] = '__star._G';
	// 		return `__star._G.set('${identifier}', ${funcDef})`;
	// 	}
	// },


	Identifier(node, scope) {
console.log('IDENTIFIER', node);
		return node.name;
	},


	// IfClause(node, scope) {
	// 	let condition = generate(node.condition, scope);
	// 	let body = this.Chunk(node, scope);
	// 	return `if (${condition}) {${body}}`;
	// },


	// IfStatement(node, scope) {
	// 	let clauses = node.clauses.map((clause) => generate(clause, scope));
	// 	return clauses.join (' else ');
	// },


	// LocalStatement(node, scope) {
	// 	let assignments = [];
	// 	let config = { initialising: true };

	// 	node.variables.forEach((variable, index) => {
	// 		let name = generate(variable, scope, config);
	// 		let value = generate(node.init[index], scope);
	// 		let match = name.match(/^(.*)\.get\('([^.]+)'\)$/);

	// 		if (match) {
	// 			let [_, subject, property] = match;
	// 			assignments.push(`${subject}.set('${property}', ${value})`);
	// 		} else {
	// 			assignments.push(`let ${name}=${value}`);
	// 		}
	// 	});
	// 	return assignments.join(';\n');
	// },


	// LogicalExpression(node, scope) {
	// 	let left = generate(node.left, scope);
	// 	let right = generate(node.right, scope);
	// 	let operator = LOGICAL_OP_MAP[node.operator];

	// 	if (!operator) {
	// 		console.log(node);
	// 		throw new Error(`Unhandled logical operator: ${node.operator}`);
	// 	}

	// 	return `(${left} ${operator} ${right})`;
	// },


	// MemberExpression(node, scope) {
	// 	console.assert(node.indexer === '.', 'Need to implement colon indexer!'); // TODO!!

	// 	let base = generate(node.base, scope);
	// 	let identifier = generate(node.identifier, scope, { isProperty: true });
	// 	return `${base}.get('${identifier}')`;
	// },


	NumericLiteral(node) {
		return node.value.toString();
	},


	// ReturnStatement(node, scope) {
	// 	let args = node.arguments.map((arg) => generate(arg, scope)).join(', ');
	// 	return `return ${args};`;
	// },


	StringCallExpression(node, scope) {
		let functionName = generate(node.base, scope);
		let arg = generate(node.argument, scope);
		return `scope.get('${functionName}')(${arg})`;
	},


	StringLiteral(node) {
		let escaped = node.value.replace(/[\\"'\n]/g, '\\$&');
		return `'${escaped}'`;
	},


	// TableConstructorExpression(node, scope) {
	// 	let fields = ''; //TODO!!!
	// 	return `new __star.T({${fields}})`;
	// },


	UnaryExpression(node, scope) {
		let operator = UNI_OP_MAP[node.operator];
		let argument = generate(node.argument, scope);
		return `${operator}${argument}`;
	}
}

let scopeIndex = 1;

function extendScope(outerIndex) {
	let scope = scopeIndex++;
	let scopeDef = `let scope${scope} = scope${outerIndex}.extend(), scope = scope${scope};`;
	return { scope, scopeDef };
}

function getIdentifierInScope(node, scope) {
	let value = generate(node, scope);
	let isIdentifier = node.type === 'Identifier';
	return isIdentifier? `scope.get('${value}')` : value;
}

function generate(ast, scope, config) {
	let generator = GENERATORS[ast.type];

	if (!generator) {
		console.info(ast);
		throw new Error(`No generator found for: ${ast.type}`);
	}

	return generator.call(GENERATORS, ast, scope, config);
}

export function generateJS(ast) {
	let init = 'let scope0 = __star.globalScope, scope = scope0;\n';
	let user = generate(ast, 0);
	return `${init}${user}`;
}
