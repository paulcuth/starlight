var Symbol = Symbol || { iterator: function () {} }; // Needed to get Babel to work in Node 

let scopeIndex = 1;
let functionIndex = 0;
let forLoopIndex = 0;

const UNI_OP_MAP = {
	'-': 'unm',
	'not': 'not',
	'#': 'len'
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
	'^': 'pow'
};

const LOGICAL_OP_MAP = {
	'and': '&&',
	'or': '||'
};


const GENERATORS = {

	AssignmentStatement(node, scope) {
		let canOptimise = true;

		let assignments = node.variables.map((variable, index) => {
			let name;
			if (isLookupExpression(variable)) {
				name = generate(variable, scope, { set: `__star_tmp[${index}]` });
				let [, root, accessor] = [].concat(name.match(/^([^.]+)(.*)$/));
				if (root === 'scope' || root.substr(0,6) === '__star') {
					return name;
				} else {
					return `scope.get('${root}')${accessor}`;
				}
			} else {
				name = scoped(variable, scope);
				let [match, subject, property] = [].concat(name.match(/^(.*).get\(([^.]+)\)$/));

				if (match) {
					return `${subject}.set(${property}, __star_tmp[${index}])`;
				} else {
					console.info(name);
					throw new Error('Unhandled'); // TODO: Remove
				}
			}
		}).join(';\n');

		let values = node.init.map((init, index) => {
			let value = scoped(init, scope);
			if (isCallExpression(init)) {
				canOptimise = false;
				return `...${value}`;
			}
			return value;
		});

		if (canOptimise) {
			return assignments.replace(/__star_tmp\[(\d+)\]/g, (match, index) => values[index]);
		} else {
			return `__star_tmp = [${values.join(', ')}];${assignments}`;
		}
	},


	BinaryExpression(node, scope) {
		let left = scoped(node.left, scope);
		let right = scoped(node.right, scope);
		let operator = BIN_OP_MAP[node.operator];

		if (isCallExpression(node.left)) {
			left += '[0]';
		}

		if (isCallExpression(node.right)) {
			right += '[0]';
		}

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled binary operator: ${node.operator}`);
		}

		return `__star_op_${operator}(${left}, ${right})`;
	},


	BooleanLiteral(node) {
		return node.value ? 'true' : 'false';
	},


	CallStatement(node, scope) {
		return generate(node.expression, scope);
	},


	CallExpression(node, scope) {
		let functionName = scoped(node.base, scope);
		let args = node.arguments.map((arg) => scoped(arg, scope));

		if (isCallExpression(node.base)) {
			args.unshift(`${functionName}[0]`);
		} else {
			if (node.base.type === 'MemberExpression' && node.base.indexer === ':') {
				let [, subject] = [].concat(functionName.match(/^(.*)\.get\('.*?'\)$/))
				args.unshift(subject);
			}
			args.unshift(`${functionName}`);
		}

		return `__star_call(${args})`;
	},


	Chunk(node, scope) {
		let output = node.body.map(statement => generate(statement, scope) + ';');
		return output.join('\n');
	},


	DoStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let body = this.Chunk(node, scope);
		return `()=>{\n${scopeDef}\n${body}\n}()`;
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
		let loopIndex = ++forLoopIndex;

		// let defs = scopeDef.split(', ');
		let init = `scope${outerScope}._forLoop${loopIndex} = ${start}`;
		let cond = `scope${outerScope}._forLoop${loopIndex} ${operator} ${end}`;
		let after = `scope${outerScope}._forLoop${loopIndex} += ${step}`;
		let varInit = `scope${scope}.setLocal('${variableName}',scope${outerScope}._forLoop${loopIndex});`;
		return `for (${init}; ${cond}; ${after}) {\n${scopeDef}\n${varInit}\n${body}\n}`;
	},


	ForGenericStatement(node, outerScope) {
		console.assert(node.iterators.length === 1, 'Only one iterator is assumed. Need to implement more!');
		let { scope, scopeDef } = extendScope(outerScope);
		let iterator = scoped(node.iterators[0], outerScope);
		let body = this.Chunk(node, scope);

		let variables = node.variables.map((variable, index) => {
			let name = generate(variable, scope);
			return `scope.setLocal('${name}', __star_tmp[${index}])`;
		}).join(';\n');

		let defs = scopeDef.split(', ');
		return `${defs[0]};\n[scope${scope}._iterator, scope${scope}._table, scope${scope}._next] = ${iterator};\nwhile((__star_tmp = __star_call(scope${scope}._iterator, scope${scope}._table, scope${scope}._next)),__star_tmp[0] !== undefined) {\nlet ${defs[1]}\nscope${scope}._next = __star_tmp[0]\n${variables}\n${body}\n}`;

	},


	FunctionDeclaration(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let isAnonymous = !node.identifier;
		let isMemberExpr = !isAnonymous && node.identifier.type === 'MemberExpression';
		let identifier = isAnonymous ? '' : generate(node.identifier, outerScope);

		let params = node.parameters.map((param, index) => {
			let name = generate(param, scope);
			if (name === '...scope.varargs') {
				return `scope.varargs = args`;
			} else {
				return `scope.setLocal('${name}', args.shift())`;
			}
		});

		let name, subject, property;
		if (isMemberExpr) {
			[, subject, property] = [].concat(identifier.match(/^(.*)\.get\('(.*?)'\)$/))
			name = property;

			if (node.identifier.indexer === ':') {
				params.unshift("scope.set('self', args.shift())");
			}
		} else {
			name = identifier;
		}

		let paramStr = params.join(';\n');
		let body = this.Chunk(node, scope);
		let prefix = isAnonymous? '' : '$';
		let funcDef = `(__star_tmp = function ${prefix}${name}(...args){${scopeDef}\n${paramStr}\n${body} return [];}, __star_tmp.toString=()=>'function: 0x${(++functionIndex).toString(16)}', __star_tmp)`;

		if (isAnonymous) {
			return funcDef;
		} else if (isMemberExpr) {
			return `scope.get('${subject}').set('${property}', ${funcDef})`;
		// } else if (node.isLocal) {
		} else {
			return `scope.set('${identifier}', ${funcDef})`;
		}
	},


	Identifier(node, scope) {
		return node.name;
	},


	IfClause(node, scope) {
		let condition = scoped(node.condition, scope);
		let body = this.Chunk(node, scope);
		return `if (__star_op_bool(${condition})) {\n${body}\n}`;
	},


	IfStatement(node, scope) {
		let clauses = node.clauses.map((clause) => generate(clause, scope));
		return clauses.join (' else ');
	},


	IndexExpression(node, scope, options = {}) {
		let base = scoped(node.base, scope);
		let index = scoped(node.index, scope);

		if (isCallExpression(node.index)) {
			index += '[0]';
		}

		if ('set' in options) {
			return `${base}.set(${index}, ${options.set})`;
		} else {
			return `${base}.get(${index})`;
		}
	},


	LocalStatement(node, scope) {
		let canOptimise = true;
		let assignments = node.variables.map((variable, index) => {
			let name = generate(variable, scope);
			return `scope.setLocal('${name}', __star_tmp[${index}])`;
		}).join(';\n');

		let values = node.init.map((init, index) => {
			let value = scoped(init, scope);
			if (isCallExpression(init)) {
				canOptimise = false;
				value = `...${value}`;
			}
			return value;
		});

		// if (canOptimise) {
		// 	return assignments.replace(/__star_tmp\[(\d+)\]/g, (match, index) => values[index]);
		// } else {
			return `__star_tmp = [${values.join(', ')}];${assignments}`;
		// }
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


	MemberExpression(node, scope, options = {}) {
		let base = generate(node.base, scope);
		let identifier = generate(node.identifier, scope);

		if (isCallExpression(node.base)) {
			base += '[0]';
		}

		if (isCallExpression(node.identifier)) {
			identifier += '[0]';
		}

		if ('set' in options) {
			return `${base}.set('${identifier}', ${options.set})`;
		} else {
			return `${base}.get('${identifier}')`;
		}
	},


	NilLiteral(node) {
		return 'undefined';
	},


	NumericLiteral(node) {
		return node.value.toString();
	},


	RepeatStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let condition = scoped(node.condition, outerScope);
		let body = this.Chunk(node, scope);

		return `do{\n${scopeDef}\n${body}\n}while(!(${condition}))`;
	},


	ReturnStatement(node, scope) {
		let args = node.arguments.map(arg => {
			let result = scoped(arg, scope);
			return isCallExpression(arg) ? `...${result}` : result;
		}).join(', ');
		return `return [${args}];`;
	},


	StringCallExpression(node, scope) {
		let functionName = scoped(node.base, scope);
		let args = [generate(node.argument, scope)];

		if (isCallExpression(node.base)) {
			return `__star_call(${functionName}[0],${args})`;
		} else {
			if (node.base.type === 'MemberExpression' && node.base.indexer === ':') {
				let [, subject] = [].concat(functionName.match(/^(.*)\.get\('.*?'\)$/))
				args.unshift(subject);
			}
			return `__star_call(${functionName},${args})`;
		}
	},


	StringLiteral(node) {
		let escaped = node.value.replace(/["']/g, '\\$&').replace(/\n/g, '\\n');
		return `'${escaped}'`;
	},


	TableCallExpression(node, scope) {
		let functionName = scoped(node.base, scope);
		let args = [generate(node.arguments, scope)];

		if (isCallExpression(node.base)) {
			return `__star_call(${functionName}[0],${args})`;
		} else {
			if (node.base.type === 'MemberExpression' && node.base.indexer === ':') {
				let [, subject] = [].concat(functionName.match(/^(.*)\.get\('.*?'\)$/))
				args.unshift(subject);
			}
			return `__star_call(${functionName},${args})`;
		}
	},


	TableConstructorExpression(node, scope) {
		let fields = node.fields.map(field => generate(field, scope)).join(';\n');
		return `new __star_T(t => {${fields}})`;
	},


	TableKeyString(node, scope) {
		let name = generate(node.key, scope);
		let value = scoped(node.value, scope);
		return `t.set('${name}', ${value})`;
	},


	TableKey(node, scope) {
		let name = generate(node.key, scope);
		let value = scoped(node.value, scope);
		return `t.set(${name}, ${value})`;
	},


	TableValue(node, scope) {
		let value = scoped(node.value, scope);
		let operator = isCallExpression(node.value) ? '...' : '';
		return `t.insert(${operator}${value})`;
	},


	UnaryExpression(node, scope) {
		let operator = UNI_OP_MAP[node.operator];
		let argument = scoped(node.argument, scope);

		if (isCallExpression(node.argument)) {
			argument += '[0]';
		}

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled unary operator: ${node.operator}`);
		}

		return `__star_op_${operator}(${argument})`;
	},

	
	VarargLiteral(node, scope) {
		return '...scope.varargs';
	},


	WhileStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let condition = scoped(node.condition, outerScope);
		let body = this.Chunk(node, scope);

		return `while(${condition}) {\n${scopeDef}\n${body}\n}`;
	}
}



function extendScope(outerIndex) {
	let scope = scopeIndex++;
	let scopeDef = `let scope${scope} = scope${outerIndex}.extend(), scope = scope${scope};`;
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
			if (root === 'scope' || root.substr(0,6) === '__star') {
				return value;	
			} else {
				return `scope.get('${root}').${path}get('${property}')`;
			}

		default: 
			return value;
	}
}


function isCallExpression(node) {
	return !!node.type.match(/CallExpression$/);
}


function isLookupExpression(node) {
	let type = node.type;
	return type === 'MemberExpression' || type === 'IndexExpression';
}


function generate(ast, scope, options) {
	let generator = GENERATORS[ast.type];

	if (!generator) {
		console.info(ast);
		throw new Error(`No generator found for: ${ast.type}`);
	}

	return generator.call(GENERATORS, ast, scope, options);
}


export function generateJS(ast) {
	let init = 'let __star = global.starlight.runtime, scope0 = __star.globalScope, scope = scope0, __star_tmp;\n';
	init += 'let __star_call = __star.call, __star_T = __star.T, __star_op_bool = __star.op.bool;';
	init += 'let __star_scope_get = Function.prototype.call.bind(__star.globalScope.constructor.prototype.get);';
	init += 'let __star_scope_set = Function.prototype.call.bind(__star.globalScope.constructor.prototype.set);';
	init += 'let __star_scope_setLocal = Function.prototype.call.bind(__star.globalScope.constructor.prototype.setLocal)';
	for (let k in UNI_OP_MAP) { init += ', __star_op_' + UNI_OP_MAP[k] + ' = __star.op.' + UNI_OP_MAP[k]; }
	for (let k in BIN_OP_MAP) { init += ', __star_op_' + BIN_OP_MAP[k] + ' = __star.op.' + BIN_OP_MAP[k]; }
	init += ';\n';
	let user = generate(ast, 0);
	user = user.replace(/scope.get\(/g, '__star_scope_get(scope, ');
	user = user.replace(/scope.set\(/g, '__star_scope_set(scope, ');
	user = user.replace(/scope.setLocal\(/g, '__star_scope_setLocal(scope, ');

	return `;()=>{ ${init}${user} }();`;
}
