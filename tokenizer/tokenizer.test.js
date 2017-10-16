import tokenizer from './tokenizer'

describe('tokenizer', () => {
	test('produces a number token', () => {
		expect(tokenizer('1')).toEqual([{ type: 'Number', value: 1 }])
	})

	test('produces a string token', () => {
		expect(tokenizer("'1'")).toEqual([{ type: 'String', value: '1' }])
	})

	test('produces a true boolean token', () => {
		expect(tokenizer('true')).toEqual([{ type: 'Boolean', value: true }])
	})

	test('produces a false boolean token', () => {
		expect(tokenizer('false')).toEqual([{ type: 'Boolean', value: false }])
	})

	test('produces a = token', () => {
		expect(tokenizer('=')).toEqual([{ type: '=' }])
	})

	test('produces a + token', () => {
		expect(tokenizer('+')).toEqual([{ type: '+' }])
	})

	test('produces a - token', () => {
		expect(tokenizer('-')).toEqual([{ type: '-' }])
	})

	test('produces a * token', () => {
		expect(tokenizer('*')).toEqual([{ type: '*' }])
	})

	test('produces a ** token', () => {
		expect(tokenizer('**')).toEqual([{ type: '**' }])
	})

	test('produces a / token', () => {
		expect(tokenizer('/')).toEqual([{ type: '/' }])
	})

	test('produces a % token', () => {
		expect(tokenizer('%')).toEqual([{ type: '%' }])
	})

	test('produces a , token', () => {
		expect(tokenizer(',')).toEqual([{ type: ',' }])
	})

	test('produces a : token', () => {
		expect(tokenizer(':')).toEqual([{ type: ':' }])
	})

	test('produces a && token', () => {
		expect(tokenizer('&&')).toEqual([{ type: '&&' }])
	})

	test('produces a || token', () => {
		expect(tokenizer('||')).toEqual([{ type: '||' }])
	})

	test('produces a | token', () => {
		expect(tokenizer('|')).toEqual([{ type: '|' }])
	})

	test('produces a . token', () => {
		expect(tokenizer('.')).toEqual([{ type: '.' }])
	})

	test('produces a ( token', () => {
		expect(tokenizer('(')).toEqual([{ type: '(' }])
	})

	test('produces a ) token', () => {
		expect(tokenizer(')')).toEqual([{ type: ')' }])
	})

	test('produces an Identifier token', () => {
		expect(tokenizer('hello')).toEqual([{ type: 'Identifier', value: 'hello' }])
	})

	test('produces open and close SquareBrackets', () => {
		expect(tokenizer('[1]')).toEqual([
			{ type: '[' },
			{ type: 'Number', value: 1 },
			{ type: ']' }
		])
	})

	test('produces open and close SquareBrackets', () => {
		expect(tokenizer('{1}')).toEqual([
			{ type: '{' },
			{ type: 'Number', value: 1 },
			{ type: '}' }
		])
	})

	test('produces strings that contain character that seem tokens', () => {
		expect(tokenizer("'{} this [] hello 1234'")).toEqual([
			{ type: 'String', value: '{} this [] hello 1234' }
		])
	})
})
