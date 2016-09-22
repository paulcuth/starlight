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
		const assignments = node.variables.reduce((result, variable, index) => {
			const name = scoped(variable, scope);

			if (name.code[0] instanceof MemExpr) {
				name.code[0].set(`__star_tmp[${index}]`);

			} else {
				name.code[0] = '$set($, \'';
				name.code[name.code.length - 1] = `\', __star_tmp[${index}]);`; 
			}

			result.push(name);
			return result;
		}, []);

		const values = parseExpressionList(node.init, scope);
		const location = node.loc;
		const initCode = { code: ['__star_tmp = ['], location };
		const code = [initCode, ...values, '];', ...assignments];
		return { code, location, notMapped: true };
	},


	BinaryExpression(node, scope) {
		const left = scoped(node.left, scope);
		const right = scoped(node.right, scope);
		const operator = BIN_OP_MAP[node.operator];

		if (isCallExpression(node.left)) {
			left.code.push('[0]');
		}

		if (isCallExpression(node.right)) {
			right.code.push('[0]');
		}

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled binary operator: ${node.operator}`);
		}

		const code = ['__star_op_', operator, '(', left, ', ', right, ')'];
		const location = node.loc;
		return { code, location };
	},


	BooleanLiteral(node) {
		return {
			code: [node.value ? 'true' : 'false'],
			location: node.loc,
		};
	},


	BreakStatement(node) {
		return {
			code: ['break'],
			location: node.loc,
		};
	},


	CallStatement(node, scope) {
		return generate(node.expression, scope);
	},


	CallExpression(node, scope) {
		const functionName = scoped(node.base, scope);
		const args = parseExpressionList(node.arguments, scope);
		const head = [];

		if (isCallExpression(node.base)) {
			head.unshift(functionName, `[0]`, ', ');

		} else {
			if (functionName.code[0] instanceof MemExpr && node.base.indexer === ':') {
				head.unshift(functionName.code[0].base, ', ');
			}
			head.unshift(functionName, ', ');
		}

		if (args.length === 0) {
			head.pop();
		}

		const code = ['__star_call(', ...head, ...args, ')'];
		const location = node.loc;
		return { code, location };
	},


	Chunk(node, scope) {
		const location = node.loc;
		const code = [];

		node.body.forEach(statement => code.push(generate(statement, scope), '\n'));
		return { location, code, notMapped: true };
	},


	DoStatement(node, outerScope) {
		let { scope, scopeDef } = extendScope(outerScope);
		const body = this.Chunk(node, scope);
		scopeDef = scopeDef.replace(',', ';');

		const code = [scopeDef, '\n', body, `\n$=$${outerScope};`];
		const location = node.loc;
		return { code, location };
	},


	ElseClause(node, scope) {
		const body = this.Chunk(node, scope);
		const code = ['{\n', body, '\n}'];
		const location = node.loc;
		return { code, location };
	},


	ElseifClause(node, scope) {
		return this.IfClause(node, scope);
	},


	ForNumericStatement(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const variableName = generate(node.variable, outerScope);
		const start = scoped(node.start, outerScope);
		const end = scoped(node.end, outerScope);
		const step = node.step === null ? '1' : generate(node.step, outerScope);
		const operator = step > 0 ? '<=' : '>=';
		const body = this.Chunk(node, scope);
		const loopIndex = ++forLoopIndex;
		const location = node.loc;

		const init = [`$${outerScope}._forLoop${loopIndex} = `, start];
		const cond = [`$${outerScope}._forLoop${loopIndex} ${operator} `, end];
		const after = [`$${outerScope}._forLoop${loopIndex} += `, step];
		const initCode = { code: [`$${scope}.setLocal('`, variableName, `',$${outerScope}._forLoop${loopIndex});`], location };
		const code = ['for (\n', ...init, ';\n', ...cond, ';\n', ...after, ') {\n', scopeDef, '\n', initCode, '\n', body, '\n}'];
		return { code, location, notMapped: true };
	},


	ForGenericStatement(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const { scope: iterationScope, scopeDef: iterationScopeDef } = extendScope(scope);
		const iterators = parseExpressionList(node.iterators, outerScope);
		const body = this.Chunk(node, iterationScope);
		const location = node.loc;

		const variables = node.variables.reduce((result, variable, index) => {
			const name = generate(variable, scope);
			result.push("$setLocal($, '", name, `', __star_tmp[${index}]);`);
			return result;
		}, []);

		const defs = scopeDef.split(', ');
		const initCode = { code: variables, location };
		const code = [`${defs[0]};\n[$${scope}._iterator, $${scope}._table, $${scope}._next] = [`, ...iterators, `\n];\nwhile((__star_tmp = __star_call($${scope}._iterator, $${scope}._table, $${scope}._next)),__star_tmp[0] !== undefined) {\n${iterationScopeDef}\$${scope}._next = __star_tmp[0]\n`, initCode, '\n', body, '\n}'];

		return { code, location, notMapped: true };
	},


	FunctionDeclaration(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const isAnonymous = !node.identifier;
		const identifier = isAnonymous ? '' : generate(node.identifier, outerScope);
		const isMemberExpr = identifier instanceof MemExpr;

		const params = node.parameters.reduce((result, param, index) => {
			const name = generate(param, scope);
			if (name.code.toString() === '...$.getVarargs()') {
				result.push('$.setVarargs(args);\n');
			} else {
				result.push("$setLocal($, '", name, "', __star_shift(args));\n");
			}

			return result;
		}, []);

		let name;
		if (isMemberExpr) {
			name = [...identifier.property];
			if (name[0] === '\'' && name[name.length - 1] === '\'') {
				name = name.slice(1, -1);
			} 

			if (node.identifier.indexer === ':') {
				params.unshift("$setLocal($, 'self', __star_shift(args));");
			}
		} else {
			name = identifier;
		}

		const body = this.Chunk(node, scope);
		body.code.pop();	// Remove newline

		const doesReturn = node.body.length > 0 && node.body[node.body.length - 1].type === 'ReturnStatement';
		const prefix = isAnonymous? '' : 'func$';
		const location = node.loc;
		const funcBootstrap = { 
			code: [scopeDef, ...params, ';'], 
			location, 
			notMapped: true 
		};
		const endNode = {
			code: [(doesReturn ? '' : '\nreturn [];'), `}, __star_tmp.toString=()=>'function: 0x${(++functionIndex).toString(16)}', __star_tmp)\n`],
			location,
			notMapped: true,
		}
		const funcDef = [`(__star_tmp = function ${prefix}`, ...name, '(...args){\n', funcBootstrap, body, endNode];

		let code;
		if (isAnonymous) {
			code = funcDef;

		} else if (isMemberExpr) {
			identifier.set(funcDef);
			code = identifier.code;

		} else {
			const local = node.isLocal ? 'Local' : '';
			code = [`$set${local}($, '`, identifier, "', ", ...funcDef, ')'];
		}

		return { code, location };
	},


	Identifier(node, scope) {
		return {
			code: [node.name],
			location: node.loc,
		};
	},


	IfClause(node, scope) {
		const condition = scoped(node.condition, scope);

		if (isCallExpression(node.condition)) {
			condition.code.push('[0]');
		}

		const body = this.Chunk(node, scope);
		const code = ['if (__star_op_bool(', condition, ')) {\n', body, '\n}'];
		const location = node.loc;
		return { code, location };
	},


	IfStatement(node, scope) {
		const clauses = node.clauses.reduce((result, clause) => {
			result.push(' else ', generate(clause, scope));
			return result;
		}, []);

		return {
			code: clauses.slice(1),
			location: node.loc,
		};
	},


	IndexExpression(node, scope) {
		let base = scoped(node.base, scope);
		let index = scoped(node.index, scope);

		if (isCallExpression(node.base)) {
			base.code.push('[0]');
		}

		if (isCallExpression(node.index)) {
			index.code.push('[0]');
		}

		return new MemExpr(base, [index], node.loc);
	},


	LocalStatement(node, scope) {
		const assignments = node.variables.reduce((result, variable, index) => {
			const name = generate(variable, scope);
			result.push("$setLocal($, '", name, `', __star_tmp[${index}]);`);
			return result;
		}, []);

		const values = parseExpressionList(node.init, scope);
		const code = ['__star_tmp = [', ...values, '];', ...assignments];
		const location = node.loc;
		return { code, location };
	},


	LogicalExpression(node, scope) {
		const left = scoped(node.left, scope);
		const right = scoped(node.right, scope);
		const operator = node.operator;
		const location = node.loc;

		if (isCallExpression(node.left)) {
			left.code.push('[0]');
		}

		if (isCallExpression(node.right)) {
			right.code.push('[0]');
		}

		let code;
		if (operator === 'and') {
			code = ['(!__star.op.bool(', left, ')?', left, ':', right, ')'];

		} else if (operator === 'or') {
			code = ['(__star.op.bool(', left, ')?', left, ':', right, ')'];

		} else {
			console.info(node);
			throw new Error(`Unhandled logical operator: ${node.operator}`);
		}

		return { code, location };
	},


	MemberExpression(node, scope) {
		const base = scoped(node.base, scope);
		const identifier = generate(node.identifier, scope);

		if (isCallExpression(node.base)) {
			base.code.push('[0]');
		}

		return new MemExpr(base, ["'", identifier, "'"], node.loc);
	},


	NilLiteral(node) {
		return {
			code: ['undefined'],
			location: node.loc,
		};
	},


	NumericLiteral(node) {
		return { 
			code: [node.value.toString()],
			location: node.loc,
		};
	},


	RepeatStatement(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const condition = scoped(node.condition, outerScope);
		const body = this.Chunk(node, scope);

		return {
			code: [`do{\n${scopeDef}\n`, body, '\n}while(!(', condition, '))'],
			location: node.loc,
		};
	},


	ReturnStatement(node, scope) {
		const args = parseExpressionList(node.arguments, scope);
		const code = ['return [', ...args, '];\n'];
		const location = node.loc;
		return { code, location };
	},


	StringCallExpression(node, scope) {
		node.arguments = node.argument;
		return this.TableCallExpression(node, scope);
	},


	StringLiteral(node) {
		const { raw, loc: location } = node;
		let code;

		if (/^\[\[[^]*]$/m.test(raw)) {
			code = [`\`${raw.substr(2, raw.length - 4).replace(/\\/g, '\\\\')}\``];
		} else {
			code = [raw.replace(/([^\\])\\(\d{1,3})/g, (_, pre, dec) => `${pre}\\u${('000' + parseInt(dec, 10).toString(16)).substr(-4)}`)];
		}

		return { code, location };
	},


	TableCallExpression(node, scope) {
		const location = node.loc;
		const functionName = scoped(node.base, scope);
		const args = generate(node.arguments, scope);
		let code;

		if (isCallExpression(node.base)) {
			code = ['__star_call(', functionName, '[0],', args, ')'];

		} else {
			if (functionName.code[0] instanceof MemExpr && node.base.indexer === ':') {
				args.code.unshift(functionName.code[0].base, ',');
			}
			code = ['__star_call(', functionName, ',', args, ')'];
		}

		return { code, location };
	},


	TableConstructorExpression(node, scope) {
		const fields = node.fields.reduce((result, field, index, arr) => {
			if (field.type == 'TableValue') {
				const isLastItem = index === arr.length - 1;
				result.push(this.TableValue(field, scope, isLastItem), ';\n');
			} else {
				result.push(generate(field, scope), ';\n');
			}
			return result;
		}, []);

		const location = node.loc;
		const initCode = { code: ['new __star_T(t => {\n'], location };
		const code = [initCode, ...fields, '})\n'];
		return { code, location, notMapped: true };
	},


	TableKeyString(node, scope) {
		const name = generate(node.key, scope);
		const value = scoped(node.value, scope);
		const code = ["Tset(t, '", name, "', ", value, ')'];
		const location = node.loc;
		return { code, location };
	},


	TableKey(node, scope) {
		const name = scoped(node.key, scope);
		const value = scoped(node.value, scope);
		const code = ['Tset(t, ', name, ', ', value, ')'];
		const location = node.loc;
		return { code, location };
	},


	TableValue(node, scope, isLastItem) {
		const location = node.loc;
		let value = scoped(node.value, scope);

		if (isCallExpression(node.value)) {
			value = isLastItem ? ['...', value] : [value, '[0]'];
		} else {
			value = [value];
		}

		const code = ['Tins(t, ', ...value, ')'];
		return { code, location };
	},


	UnaryExpression(node, scope) {
		const operator = UNI_OP_MAP[node.operator];
		const argument = scoped(node.argument, scope);

		if (isCallExpression(node.argument)) {
			argument.push('[0]');
		}

		if (!operator) {
			console.info(node);
			throw new Error(`Unhandled unary operator: ${node.operator}`);
		}

		const code = [`__star_op_${operator}(`, argument, ')'];
		const location = node.loc;
		return { code, location };
	},

	
	VarargLiteral(node) {
		return {
			code: ['...$.getVarargs()'],
			location: node.loc,
		};
	},


	WhileStatement(node, outerScope) {
		const { scope, scopeDef } = extendScope(outerScope);
		const condition = scoped(node.condition, outerScope);
		const body = this.Chunk(node, scope);

		const code = ['while(', condition, ') {\n', scopeDef, '\n', body, '\n}'];
		const location = node.loc;  
		return { code, location };
	},

};


// // TODO: Remove
// Object.keys(GENERATORS).forEach(key => {
// 	const handler = GENERATORS[key];
// 	GENERATORS[key] = (...args) => {
// 		const result = handler.call(GENERATORS, ...args);
// 		if (
// 			typeof result !== 'object'
// 			|| !result.code
// 			|| !result.location
// 		){
// console.log(result);
// 			throw new Error('DOES NOT RETURN SOURCE MAP: ' + key);
// 		}
// 		return result;
// 	}
// });


function parseExpressionList(expressionNodeArray, scope) {
	const result = expressionNodeArray.reduce((result, node, index, arr) => {
		const value = scoped(node, scope);
		if (isCallExpression(node)) {
			if (index == arr.length - 1) {
				result.push('...', value);
			} else {
				result.push(value, '[0]');
			}
		} else {
			result.push(value);
		}
		result.push(', ');
		return result;
	}, []);
	return result.slice(0, -1);
}


function replaceInCode(block, pattern, replace) {
	return {
		location: block.location,
		code: block.code.map(item => {
			if (typeof item === 'string') {
				return item.replace(pattern, replace);
			} else {
				return replaceInCode(item, pattern, replace);
			}
		}),
	};
}


export function extendScope(outerIndex) {
	const scope = scopeIndex++;
	const scopeDef = `let $${scope} = $${outerIndex}.extend(), $ = $${scope};`;
	return { scope, scopeDef };
}


function scoped(node, scope) {
	const value = generate(node, scope);

	return {
		code: node.type === 'Identifier' ? ['$get($, \'', value, '\')'] : [value],
		location: node.loc,
	};
}


function isCallExpression(node) {
	return !!node.type.match(/CallExpression$/);
}


function generate(ast, scope) {
	// console.log('>>-->', ast.type);
	const generator = GENERATORS[ast.type];

	if (!generator) {
		console.info(ast);
		throw new Error(`No generator found for: ${ast.type}`);
	}

	return generator.call(GENERATORS, ast, scope);
}


export function generateTree(ast, scope) {
	return generate(ast, scope);
}


export function generateJS(tree) {
	return tree.code.map(item => {
		return (typeof item === 'string') ? item : generateJS(item);
	}).join('');
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

