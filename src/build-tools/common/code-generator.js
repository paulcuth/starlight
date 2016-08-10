import { default as MemExpr } from './MemExpr';


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


const GENERATORS = {

	AssignmentStatement(node, scope) {
		let assignments = node.variables.map((variable, index) => {
			const name = scoped(variable, scope);

			if (name instanceof MemExpr) {
				return name.set(`__star_tmp[${index}]`);
			} else {
				const [match, args] = [].concat(name.match(/^\$get\((.*)\)$/));
				if (!match) {
					throw new Error('Unhandled'); 
				}

				return `$set(${args}, __star_tmp[${index}])`;
			}
		}).join(';\n');

		const values = parseExpressionList(node.init, scope).join(', ');
		return `__star_tmp = [${values}];${assignments}`;
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


	BreakStatement(node) {
		return 'break';
	},


	CallStatement(node, scope) {
		return generate(node.expression, scope);
	},


	CallExpression(node, scope) {
		let functionName = scoped(node.base, scope);
		const args = parseExpressionList(node.arguments, scope);

		if (isCallExpression(node.base)) {
			args.unshift(`${functionName}[0]`);
		} else {
			if (functionName instanceof MemExpr && node.base.indexer === ':') {
				args.unshift(functionName.base);
			}
			args.unshift(`${functionName}`);
		}

		return `__star_call(${args})`;
	},


	Chunk(node, scope) {
		const location = node.loc;
		const code = [];

		node.body.forEach(statement => code.push(generate(statement, scope), ';\n'));
		return { location, code };
	},


	DoStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let body = this.Chunk(node, scope);
		scopeDef = scopeDef.replace(',', ';');
		return `${scopeDef}\n${body}\n$=$${outerScope};`;
	},


	ElseClause(node, scope) {
		let body = this.Chunk(node, scope);
		return `{\n${body}\n}`;
	},


	ElseifClause(node, scope) {
		return this.IfClause(node, scope);
	},


	ForNumericStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let variableName = generate(node.variable, outerScope);
		let start = scoped(node.start, outerScope);
		let end = scoped(node.end, outerScope);
		let step = node.step === null ? 1 : generate(node.step, outerScope);
		let operator = step > 0 ? '<=' : '>=';
		let body = this.Chunk(node, scope);
		let loopIndex = ++forLoopIndex;

		let init = `$${outerScope}._forLoop${loopIndex} = ${start}`;
		let cond = `$${outerScope}._forLoop${loopIndex} ${operator} ${end}`;
		let after = `$${outerScope}._forLoop${loopIndex} += ${step}`;
		let varInit = `$${scope}.setLocal('${variableName}',$${outerScope}._forLoop${loopIndex});`;
		return `for (${init}; ${cond}; ${after}) {\n${scopeDef}\n${varInit}\n${body}\n}`;
	},


	ForGenericStatement(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const { scope: iterationScope, scopeDef: iterationScopeDef } = extendScope(scope);
		const iterators = parseExpressionList(node.iterators, outerScope).join(', ');
		const body = this.Chunk(node, iterationScope);

		const variables = node.variables.map((variable, index) => {
			const name = generate(variable, scope);
			return `$setLocal($, '${name}', __star_tmp[${index}])`;
		}).join(';\n');

		const defs = scopeDef.split(', ');
		return `${defs[0]};\n[$${scope}._iterator, $${scope}._table, $${scope}._next] = [${iterators}];\nwhile((__star_tmp = __star_call($${scope}._iterator, $${scope}._table, $${scope}._next)),__star_tmp[0] !== undefined) {\n${iterationScopeDef}\$${scope}._next = __star_tmp[0]\n${variables}\n${body}\n}`;
	},


	FunctionDeclaration(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let isAnonymous = !node.identifier;
		let identifier = isAnonymous ? '' : generate(node.identifier, outerScope);
		let isMemberExpr = identifier instanceof MemExpr;

		let params = node.parameters.map((param, index) => {
			let name = generate(param, scope);
			if (name === '...$.getVarargs()') {
				return `$.setVarargs(args)`;
			} else {
				return `$setLocal($, '${name}', __star_shift(args))`;
			}
		});

		let name;
		if (isMemberExpr) {
			name = identifier.property.replace(/'/g, '');

			if (node.identifier.indexer === ':') {
				params.unshift("$setLocal($, 'self', __star_shift(args))");
			}
		} else {
			name = identifier;
		}

		let paramStr = params.join(';\n');
		let body = this.Chunk(node, scope);
		let prefix = isAnonymous? '' : 'func$';
		let funcDef = `(__star_tmp = function ${prefix}${name}(...args){${scopeDef}\n${paramStr};\n${body} return [];}, __star_tmp.toString=()=>'function: 0x${(++functionIndex).toString(16)}', __star_tmp)`;

		if (isAnonymous) {
			return funcDef;
		} else if (isMemberExpr) {
			return identifier.set(funcDef);
		} else {
			const local = node.isLocal ? 'Local' : '';
			return `$set${local}($, '${identifier}', ${funcDef})`;
		}
	},


	Identifier(node, scope) {
		return {
			location: node.loc,
			code: [node.name],
		};
	},


	IfClause(node, scope) {
		let condition = scoped(node.condition, scope);

		if (isCallExpression(node.condition)) {
			condition += '[0]';
		}

		let body = this.Chunk(node, scope);
		return `if (__star_op_bool(${condition})) {\n${body}\n}`;
	},


	IfStatement(node, scope) {
		let clauses = node.clauses.map((clause) => generate(clause, scope));
		return clauses.join (' else ');
	},


	IndexExpression(node, scope) {
		let base = scoped(node.base, scope);
		let index = scoped(node.index, scope);

		if (isCallExpression(node.base)) {
			base += '[0]';
		}

		if (isCallExpression(node.index)) {
			index += '[0]';
		}

		return new MemExpr(base, index);
	},


	LocalStatement(node, scope) {
		let assignments = node.variables.map((variable, index) => {
			let name = generate(variable, scope);
			return `$setLocal($, '${name}', __star_tmp[${index}])`;
		}).join(';\n');

		const values = parseExpressionList(node.init, scope).join(', ');
		return `__star_tmp = [${values}];${assignments}`;
	},


	LogicalExpression(node, scope) {
		let left = scoped(node.left, scope);
		let right = scoped(node.right, scope);
		let operator = node.operator;

		if (isCallExpression(node.left)) {
			left += '[0]';
		}

		if (isCallExpression(node.right)) {
			right += '[0]';
		}

		if (operator === 'and') {
			return `(!__star.op.bool(${left})?${left}:${right})`

		} else if (operator === 'or') {
			return `(__star.op.bool(${left})?${left}:${right})`

		} else {
			console.info(node);
			throw new Error(`Unhandled logical operator: ${node.operator}`);
		}
	},


	MemberExpression(node, scope) {
		let base = scoped(node.base, scope);
		let identifier = generate(node.identifier, scope);

		if (isCallExpression(node.base)) {
			base += '[0]';
		}

		return new MemExpr(base, `'${identifier}'`);
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
		const args = parseExpressionList(node.arguments, scope).join(', ');
		return `return [${args}];`;
	},


	StringCallExpression(node, scope) {
		node.arguments = node.argument;
		return this.TableCallExpression(node, scope);
	},


	StringLiteral(node) {
		const { raw, loc } = node;
		let code;

		if (/^\[\[[^]*]$/m.test(raw)) {
			code = [`\`${raw.substr(2, raw.length - 4).replace(/\\/g, '\\\\')}\``];
		} else {
			code = [raw.replace(/([^\\])\\(\d{1,3})/g, (_, pre, dec) => `${pre}\\u${('000' + parseInt(dec, 10).toString(16)).substr(-4)}`)];
		}

		return { code, location: loc };
	},


	TableCallExpression(node, scope) {
		const location = node.loc;
		const functionName = scoped(node.base, scope);
		const args = generate(node.arguments, scope);
		let code;

		if (isCallExpression(node.base)) {
			code = ['__star_call(', functionName, '[0],', args, ')'];

		} else {
			if (functionName instanceof MemExpr && node.base.indexer === ':') {
				args.unshift(functionName.base);
			}
			code = ['__star_call(', functionName, ',', args, ')'];
		}

		return { code, location };
	},


	TableConstructorExpression(node, scope) {
		let fields = node.fields.map((field, index, arr) => {
			if (field.type == 'TableValue') {
				const isLastItem = index === arr.length - 1;
				return this.TableValue(field, scope, isLastItem);
			}
			return generate(field, scope);
		}).join(';\n');

		return `new __star_T(t => {${fields}})`;
	},


	TableKeyString(node, scope) {
		let name = generate(node.key, scope);
		let value = scoped(node.value, scope);
		return `Tset(t, '${name}', ${value})`;
	},


	TableKey(node, scope) {
		let name = scoped(node.key, scope);
		let value = scoped(node.value, scope);
		return `Tset(t, ${name}, ${value})`;
	},


	TableValue(node, scope, isLastItem) {
		let value = scoped(node.value, scope);
		if (isCallExpression(node.value)) {
			value = isLastItem ? `...${value}` : `${value}[0]`;
		}
		return `Tins(t, ${value})`;
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

	
	VarargLiteral(node) {
		return '...$.getVarargs()';
	},


	WhileStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		let condition = scoped(node.condition, outerScope);
		let body = this.Chunk(node, scope);

		return `while(${condition}) {\n${scopeDef}\n${body}\n}`;
	},

};



function parseExpressionList(expressionNodeArray, scope) {
	return expressionNodeArray.map((node, index, arr) => {
		let value = scoped(node, scope);
		if (isCallExpression(node)) {
			if (index == arr.length - 1) {
				return `...${value}`;
			}
			return `${value}[0]`;
		}
		return value;
	});
}


function extendScope(outerIndex) {
	let scope = scopeIndex++;
	let scopeDef = `let $${scope} = $${outerIndex}.extend(), $ = $${scope};`;
	return { scope, scopeDef };
}


function scoped(node, scope) {
	const value = generate(node, scope);
	return {
		location: node.loc,
		code: node.type === 'Identifier' ? ['$get($, \'', value, '\')'] : value,
	};
}


function isCallExpression(node) {
	return !!node.type.match(/CallExpression$/);
}


function generate(ast, scope) {
	let generator = GENERATORS[ast.type];

	if (!generator) {
		console.info(ast);
		throw new Error(`No generator found for: ${ast.type}`);
	}

	return generator.call(GENERATORS, ast, scope);
}


export function generateTree(ast) {
	return generate(ast, 0);
}


export function getRuntimeInit() {
	let init = '"use strict"; if (typeof global === \'undefined\' && typeof window !== \'undefined\') { window.global = window; }';
	init += 'let __star = global.starlight.runtime, $0 = __star.globalScope, $ = $0, __star_tmp;';
	init += 'let __star_call = __star.call, __star_T = __star.T, __star_op_bool = __star.op.bool;';
	init += 'let __star_op_unm = __star.op.unm, __star_op_not = __star.op.not, __star_op_len = __star.op.len, __star_op_concat = __star.op.concat, __star_op_add = __star.op.add, __star_op_sub = __star.op.sub, __star_op_mul = __star.op.mul, __star_op_div = __star.op.div, __star_op_mod = __star.op.mod, __star_op_eq = __star.op.eq, __star_op_neq = __star.op.neq, __star_op_lt = __star.op.lt, __star_op_gt = __star.op.gt, __star_op_lte = __star.op.lte, __star_op_gte = __star.op.gte, __star_op_pow = __star.op.pow;';
	init += 'let __star_op_and = __star.op.and, __star_op_or = __star.op.or;';
	
	init += 'let Tget, Tset, Tins, $get, $set, $setLocal, __star_shift;';

	init += '(()=>{';
	init += 'let call = Function.prototype.call, bind = call.bind.bind(call), Tproto = __star_T.prototype, $proto = __star.globalScope.constructor.prototype;';

	init += 'Tget = bind(Tproto.get), Tset = bind(Tproto.set), Tins = bind(Tproto.insert);';
	init += '$get = bind($proto.get), $set = bind($proto.set), $setLocal = bind($proto.setLocal);';
	init += '__star_shift = bind(Array.prototype.shift);';
	init += '})();\n'

	return init;
}

