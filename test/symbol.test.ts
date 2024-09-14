import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/symbol.d.ts'
})

describe('symbol test', () => {
  const result = typeToValue.run('test/dts/symbol.d.ts', 'SymbolData')

  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })

  test('SymbolData convert correctly', () => {
    expect(result).toMatchSnapshot()
  })
})