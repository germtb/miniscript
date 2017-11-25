import { traverse } from '../traverse'
import path from 'path'
import fs from 'fs'
import tokenizer from '../../tokenizer'
import parse from '../../parser'
import { File, Declaration } from '../../parser/nodes'

export const resolveImports = (
	ast,
	pwd,
	bin,
	modules = { local: {}, core: {} }
) =>
	traverse(ast, {
		File: {
			map: file => {
				return new File(
					file.nodes.reduce((acc, node) => {
						if (node.type === 'ImportDeclaration') {
							const modulePath = node.path.value
							const filename = path.resolve(pwd, modulePath) + '.sn'

							if (modules[filename]) {
								const importedModule = modules[filename]
								const module = importedModule.nodes.find(
									n =>
										n.type === 'Declaration' && n.declarator.name === 'module'
								)
								acc.push(new Declaration(node.declarator, module.value))
							} else {
								const dirname = path.dirname(filename)
								const file = fs.readFileSync(filename, 'utf8')
								const fileAST = parse(tokenizer(file))
								const importedModule = resolveImports(fileAST, dirname, modules)
								modules[filename] = importedModule

								acc.push(
									...importedModule.nodes.map(
										n =>
											n.type === 'Declaration' && n.declarator.name === 'module'
												? new Declaration(node.declarator, n.value)
												: n
									)
								)
							}
						} else {
							acc.push(node)
						}

						return acc
					}, [])
				)
			}
		}
	})
