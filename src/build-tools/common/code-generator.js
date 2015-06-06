var Symbol = Symbol || { iterator: function () {} }; // Needed to get Babel to work in Node 

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

	AssignmentStatement(node, scope) {
		let assignments = [];
		node.variables.forEach((variable, index) => {
			let name = generate(variable, scope);
			let value = generate(node.init[index], scope);
			let match = name.match(/^(.*)\.get\('([^.]+)'\)$/);
			// let match = name.match(/^([^.]+)\.((.*)\.)?get\('([^.]+)'\)$/);

			if (match) {
				let [_, subject, property] = match;
				// let [_, subject, _, path, property] = match;
				assignments.push(`${subject}.set('${property}', ${value})`);
				// assignments.push(`${subject}.set('${property}', ${value})`);

			} else {
				assignments.push(`${name}=${value}`);
			}
		});
		return assignments.join(';\n');
	},


	BinaryExpression(node, scope) {
		let left = generate(node.left, scope);
		let right = generate(node.right, scope);
		let operator = BIN_OP_MAP[node.operator];

		if (!operator) {
			console.log(node);
			throw new Error(`Unhandled binary operator: ${node.operator}`);
		}

		return `__star.op.${operator}(${left}, ${right})`
	},


	CallStatement(node, scope) {
		let expression = generate(node.expression, scope);
		return `${expression};`;
	},


	CallExpression(node, scope) {
		let base = generate(node.base, scope);
		let args = node.arguments.map((arg) => generate(arg, scope)).join(', ');
		return `${base}(${args})`;
	},

	Chunk(node, scope) {
		let output = [];
		let statement, i;

		for (i = 0; statement = node.body[i]; i++) {
			output.push(generate(statement, scope) + ';');
		}

		return output.join('\n');
	},


	DoStatement(node, outerScope) {
		let scope, scopeDef = extendScope(outerScope);
		let body = this.Chunk(node, scope);
		return `(function() {\n${scopeDef}\n${body}\n})()`;
	},


	ElseClause(node, scope) {
		let body = this.Chunk(node, scope);
		return `{${body}}`;
	},


	ForNumericStatement(node, outerScope) {
		let variable = generate(node.variable, outerScope, { initialising: true });
		let start = generate(node.start, outerScope);
		let end = generate(node.end, outerScope);
		let step = node.step === null ? 1 : generate(node.step, outerScope);
		let operator = start < end ? '<=' : '>=';

		let scope, scopeDef = extendScope(outerScope);
		scope[variable] = true;

		let body = this.Chunk(node, scope);
		return `for (let ${variable} = ${start}; ${variable} ${operator} ${end}; ${variable} += ${step}) {\n${scopeDef}\n${body}\n}`;
	},


	FunctionDeclaration(node, outerScope) {
		let scope, scopeDef = extendScope(outerScope);
		let parameters = node.parameters.map((param) => generate(param, scope, { initialising: true })).join();
		let body = this.Chunk(node, scope);
		let funcScope;

		if (node.isLocal) {
			funcScope = outerScope;
		} else {
			// Get global
			funcScope = outerScope;
			while (funcScope.__proto__ !== Object.prototype) { // Ugly
				funcScope = funcScope.__proto__;
			}
		}

		let identifier = generate(node.identifier, funcScope, { initialising: true });
		let funcDef = `function ${identifier}(${parameters}){${scopeDef}\n${body}}`;

		if (node.isLocal) {
			return `let ${identifier} = ${funcDef}`;
		} else {
			funcScope[identifier] = '__star._G';
			return `__star._G.set('${identifier}', ${funcDef})`;
		}
	},


	Identifier(node, scope, config = {}) {
		let name = node.name;

		if (config.isProperty) {
			return name;
		}

		return `scope.get('${name}')`;
	},


	IfClause(node, scope) {
		let condition = generate(node.condition, scope);
		let body = this.Chunk(node, scope);
		return `if (${condition}) {${body}}`;
	},


	IfStatement(node, scope) {
		let clauses = node.clauses.map((clause) => generate(clause, scope));
		return clauses.join (' else ');
	},


	LocalStatement(node, scope) {
		let assignments = [];
		let config = { initialising: true };

		node.variables.forEach((variable, index) => {
			let name = generate(variable, scope, config);
			let value = generate(node.init[index], scope);
			let match = name.match(/^(.*)\.get\('([^.]+)'\)$/);

			if (match) {
				let [_, subject, property] = match;
				assignments.push(`${subject}.set('${property}', ${value})`);
			} else {
				assignments.push(`let ${name}=${value}`);
			}
		});
		return assignments.join(';\n');
	},


	LogicalExpression(node, scope) {
		let left = generate(node.left, scope);
		let right = generate(node.right, scope);
		let operator = LOGICAL_OP_MAP[node.operator];

		if (!operator) {
			console.log(node);
			throw new Error(`Unhandled logical operator: ${node.operator}`);
		}

		return `(${left} ${operator} ${right})`;
	},


	MemberExpression(node, scope) {
		console.assert(node.indexer === '.', 'Need to implement colon indexer!'); // TODO!!

		let base = generate(node.base, scope);
		let identifier = generate(node.identifier, scope, { isProperty: true });
		return `${base}.get('${identifier}')`;
	},


	NumericLiteral(node) {
		return node.value.toString();
	},


	ReturnStatement(node, scope) {
		let args = node.arguments.map((arg) => generate(arg, scope)).join(', ');
		return `return ${args};`;
	},


	StringCallExpression(node, scope) {
		let base = generate(node.base, scope);
		let arg = generate(node.argument, scope);
		return `${base}(${arg})`;
	},


	StringLiteral(node) {
		let escaped = node.value.replace(/[\\"'\n]/g, '\\$&');
		return `'${escaped}'`;
	},


	TableConstructorExpression(node, scope) {
		let fields = ''; //TODO!!!
		return `new __star.T({${fields}})`;
	},


	UnaryExpression(node, scope) {
		let operator = node.operator;
		let argument = generate(node.argument, scope);

		if (operator === 'not') {
			operator = '!';
		}
	
		return `${operator}${argument}`;
	}
}

let scopeIndex = 1;

function extendScope(outerIndex) {
	let index = scopeIndex++;
	let def = `let scope${index} = scope${outerIndex}.extend(), scope = scope${index};`;
	return index, def;
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
