import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/object.d.ts'
})

describe('non <Literal> value object test', () => {
  const result = typeToValue.run('test/dts/object.d.ts', 'DataObject')
  test('DataObject object convert success test', () => {
    expect(result).toBeTruthy()
    expect(result).toMatchSnapshot()
  })
  test('object property test', () => {
    ['a', 'b', 'c', 'd', 'e'].forEach(key => {
      expect(result).toHaveProperty(key)
    })
  })

  test('object value type test', () => {
    expect(typeof result.a).toBe('string')
    expect(typeof result.b).toBe('number')
    expect(typeof result.c).toBe('boolean')
    expect(typeof result.d).toBe('undefined')
    expect(result.e).toBeNull()
  })
})

describe('<Literal> value object test', () => {
  const result = typeToValue.run('test/dts/object.d.ts', 'LiteralValue')
  test('LiteralValue object convert success test', () => {
    expect(result).toBeTruthy()
    expect(result).toMatchSnapshot()
  })
  test('object property test', () => {
    ['a', 'b', 'c',].forEach(key => {
      expect(result).toHaveProperty(key)
    })
  })

  test('object value type test', () => {
    expect(typeof result.a).toBe('string')
    expect(typeof result.b).toBe('number')
    expect(typeof result.c).toBe('boolean')
  })
})

describe('<Partial> value object test', () => {
  const result = typeToValue.run('test/dts/object.d.ts', 'DataObject2')
  test('Partial object convert success test', () => {
    expect(result).toMatchSnapshot()
  })
})