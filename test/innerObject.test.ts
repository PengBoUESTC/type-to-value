import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/inner.d.ts'
})

describe('base test', () => {
  const result = typeToValue.run('test/dts/inner.d.ts', 'DataInner')
  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('sourceFiles cache correctly', () => {
    expect(typeToValue.sourceFiles).toHaveProperty('DataInner-1')
  })
  test('DataInner value convert success', () => {
    expect(result).toMatchSnapshot()
  })
  test('inner nest <Literal> value success', () => {
    expect(result.a.a).toBe(100)
    expect(typeof result.a.a).toBe('number')
  })
  test('inner nest non <Literal> value success', () => {
    expect(typeof result.b.b).toBe('string')
  })
})