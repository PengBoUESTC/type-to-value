import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/recursion.d.ts'
})

describe('base recursion test', () => {
  const result = typeToValue.run('test/dts/recursion.d.ts', 'RecursionTest')
  test('RecursionTest object convert success test', () => {
    expect(result).toBeTruthy()
    expect(result).toMatchSnapshot()
  })
})