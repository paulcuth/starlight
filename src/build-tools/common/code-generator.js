var Symbol = Symbol || { iterator: function () {} }; // Needed to get Babel to work in Node 

const UNI_OP_MAP = {
	'-': '-%1',
	'not': '!%1',
	'#': '__star.op.len(%1)'
};

const BIN_OP_MAP = {
	'..': 'concat',
	'+': 'add', 
	'-': 'sub', 
	'*': 'mul', 
	'/': 'div',
	'%': 'mod',
	'==': 'eq',
	'~=': 'neq',
	'<': 'lt',
	'>': 'gt',
	'<=': 'lte',
	'>=': 'gte',
};

const LOGICAL_OP_MAP = {
	'and': '&&',
	'or': '||'
};


const GENERATORS = {

	AssignmentStatement(node, scope) {
		let assignments = node.variables.map((variable, index) => {
			let name = scoped(variable, scope);
			let value = generate(node.init[index], scope);
			let match = name.match(/^(.*).get\('([^.]+)'\)$/);

			if (match) {
				let [_, subject, property] = match;
				return `${subject}.set('${property}', ${value})`;
			} else {
				console.info(name);
				throw new Error('Unhandled'); // TODO: Remove
			}
		});
		return assignments.join(';\n');
	},


	BinaryExpression(node, scope) {
		let left = scoped(node.left, scope);
		let right = scoped(node.right, scope);
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
		let args = node.arguments.map((arg) => scoped(arg, scope)).join(', ');
		return `scope.get('${functionName}')(${args})`;
	},


	Chunk(node, scope) {
		let output = node.body.map(statement => generate(statement, scope) + ';');
		return output.join('\n');
	},


	DoStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let body = this.Chunk(node, scope);
		return `(function() {\n${scopeDef}\n${body}\n})()`;
	},


	ElseClause(node, scope) {
		let body = this.Chunk(node, scope);
		return `{\n${body}\n}`;
	},


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


	FunctionDeclaration(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let isAnonymous = !node.identifier;
		let identifier = isAnonymous ? '' : generate(node.identifier, outerScope);

		let params = node.parameters.map((param, index) => {
// console.log('PARAM', param);
			let name = generate(param, scope);
			return `scope.set('${name}', args[${index}]);`;
		}).join('\n');

		let body = this.Chunk(node, scope);
		let funcDef = `function ${identifier}(...args){${scopeDef}\n${params}\n${body}}`;

		if (isAnonymous) {
			return funcDef;
		} else if (node.isLocal) {
			return `scope.set('${identifier}', ${funcDef})`;
		} else {
			return `__star.globalScope.set('${identifier}', ${funcDef})`;
		}
	},


	Identifier(node, scope) {
		return node.name;
	},


	IfClause(node, scope) {
		let condition = scoped(node.condition, scope);
		let body = this.Chunk(node, scope);
		return `if (${condition}) {\n${body}\n}`;
	},


	IfStatement(node, scope) {
		let clauses = node.clauses.map((clause) => generate(clause, scope));
		return clauses.join (' else ');
	},


	LocalStatement(node, scope) {
		let assignments = node.variables.map((variable, index) => {
			let name = generate(variable, scope);
			return `scope.setLocal('${name}', __star_tmp[${index}])`;
		}).join(';\n');

		let values = node.init.map((init, index) => {
			let value = scoped(init, scope);
			if (init.type === 'CallExpression') {
				value = `...${value}`;
			}
			return value;
		}).join(', ');

		return `__star_tmp = [${values}];${assignments}`;
	},


	LogicalExpression(node, scope) {
		let left = scoped(node.left, scope);
		let right = scoped(node.right, scope);
		let operator = LOGICAL_OP_MAP[node.operator];

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled logical operator: ${node.operator}`);
		}

		return `(${left} ${operator} ${right})`;
	},


	MemberExpression(node, scope) {
		console.assert(node.indexer === '.', 'Need to implement colon indexer!'); // TODO!!

		let base = generate(node.base, scope);
		let identifier = generate(node.identifier, scope);
		return `${base}.get('${identifier}')`;
	},


	NilLiteral(node) {
		return 'undefined';
	},


	NumericLiteral(node) {
		return node.value.toString();
	},


	ReturnStatement(node, scope) {
		let args = node.arguments.map((arg) => scoped(arg, scope)).join(', ');
		return `return [${args}];`;
	},


	StringCallExpression(node, scope) {
		let functionName = generate(node.base, scope);
		let arg = generate(node.argument, scope);
		return `scope.get('${functionName}')(${arg})`;
	},


	StringLiteral(node) {
		let escaped = node.value.replace(/["'\n]/g, '\\$&');
		return `'${escaped}'`;
	},


	TableConstructorExpression(node, scope) {
		let fields = ''; //TODO!!!
		return `new __star.T({${fields}})`;
	},


	UnaryExpression(node, scope) {
		let operator = UNI_OP_MAP[node.operator];
		let argument = scoped(node.argument, scope);

		if (!operator) {
			console.info(node);
			throw new ReferenceError('Unhandled unary operator');
		}

		return operator.replace('%1', argument, 'g');
	}
}


let scopeIndex = 1;

function extendScope(outerIndex) {
	let scope = scopeIndex++;
	let scopeDef = `let scope${scope} = scope${outerIndex}.extend(), scope = scope${scope};scope._index=${scope};`;
	return { scope, scopeDef };
}


function scoped(node, scope) {
	let value = generate(node, scope);
	switch (node.type) {
		case 'Identifier': 
			return `scope.get('${value}')`;

		case 'MemberExpression':
			let [_, root, path, property] = value.match(/^([^.]+)\.(.*\.)?get\('([^.]+)'\)$/);
			path = path || '';
			return `scope.get('${root}').${path}get('${property}')`;

		default: 
			return value;
	}
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
	let init = 'let scope0 = __star.globalScope, scope = scope0, __star_tmp;\n';
	let user = generate(ast, 0);
	return `${init}${user}`;
}
