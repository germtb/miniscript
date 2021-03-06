import path from 'path'
import fs from 'fs'

export const visitorsFactory = ({
	aval,
	run,
	get,
	match,
	createFunction,
	operations
}) => ({
	File: (node, scopes, internals) => {
		node.nodes.forEach(node => {
			aval(node, scopes, internals)
		})

		return scopes[scopes.length - 1].module
	},
	ImportDeclaration: (node, scopes, { modules }) => {
		const relativeModule = node.path.value[0] === '.'
		const moduleName = relativeModule
			? path.resolve(get('dirname', scopes), node.path.value + '.sn')
			: node.path.value

		let module

		if (!relativeModule || moduleName in modules) {
			module = modules[moduleName]
		} else if (relativeModule) {
			const dirname = path.dirname(moduleName)
			const moduleScope = [{ filename: moduleName, dirname }]
			const file = fs.readFileSync(moduleName, 'utf8')
			run(file, moduleScope)
			module = moduleScope[0].module
			modules[moduleName] = module
		}

		match(node.declarator, module, scopes[scopes.length - 1])
	},
	IdentifierExpression: (node, scopes) => {
		return get(node.name, scopes)
	},
	BooleanExpression: node => {
		return { value: node.value, type: 'Boolean' }
	},
	NumberExpression: node => {
		return { value: node.value, type: 'Number' }
	},
	StringExpression: node => {
		return { value: node.value, type: 'String' }
	},
	ArrayExpression: (node, scopes) => {
		const value = node.values.reduce((acc, value) => {
			if (value.type === 'RestElement') {
				const restValue = aval(value.value, scopes).value
				acc.push(...restValue)
			} else {
				acc.push(aval(value, scopes))
			}
			return acc
		}, [])
		return { value, type: 'Array' }
	},
	ObjectExpression: (node, scopes) => {
		const value = node.properties.reduce((acc, value) => {
			const keyValues = aval(value, scopes)
			Object.keys(keyValues).forEach(key => {
				acc[key] = keyValues[key]
			})
			return acc
		}, {})
		return { value, type: 'Object' }
	},
	ObjectProperty: (node, scopes) => {
		const { property } = node
		if (property.type === 'NamedParameter') {
			return { [property.name]: aval(property.value, scopes) }
		} else if (property.type === 'IdentifierExpression') {
			return { [property.name]: get(property.name, scopes) }
		} else if (property.type === 'RestElement') {
			return aval(property.value, scopes).value
		}
	},
	ObjectAccessExpression: (node, scopes) => {
		const obj = aval(node.expression, scopes)
		return obj.value[node.accessIdentifier.name]
	},
	BinaryExpression: (node, scopes) => {
		const left = aval(node.left, scopes)
		const right = aval(node.right, scopes)
		const operator = node.operator.operator
		const operation = operations[operator]

		return operation(left, right)
	},
	UnaryExpression: (node, scopes) => {
		const expression = aval(node.expression, scopes)
		const op = node.operator.operator

		if (op === 'not') {
			return !expression
		} else if (op === 'type') {
			return expression.type
		}
	},
	FunctionExpression: (node, scopes) => {
		return createFunction(node.parameters, node.body, scopes)
	},
	CallExpression: (node, scopes) => {
		const func = aval(node.callee, scopes)
		const parameters = node.parameters.map(node => aval(node, scopes))
		return func.call(parameters)
	},
	NamedParameter: (node, scopes) => {
		return {
			type: 'NamedParameter',
			name: node.name,
			value: aval(node.value, scopes)
		}
	},
	LetExpression: (node, scopes) => {
		const letScope = [...scopes, {}]
		node.declarations.forEach(d => {
			aval(d, letScope)
		})
		return aval(node.expression, letScope)
	},
	PatternExpression: (node, scopes) => {
		const expression = aval(node.expression, scopes)

		for (let i = 0; i < node.patternCases.length; i++) {
			const pattern = node.patternCases[i]
			const matchedScope = {}
			const matched = match(pattern.pattern, expression, matchedScope)

			if (matched) {
				return aval(pattern.result, [...scopes, matchedScope])
			}
		}

		throw new Error('PatternExpression did not match')
	},
	Declaration: (node, scopes) => {
		const { declarator, value } = node
		const expression = aval(value, scopes)
		match(declarator, expression, scopes[scopes.length - 1])
	}
})
