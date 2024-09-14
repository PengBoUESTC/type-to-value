import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/config*.d.ts'
})

describe('config test', () => {

  test('config convert correctly :: current key', () => {
    const result = typeToValue.getConfig('a', {
      'a': 100
    })
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: not include key', () => {
    const result = typeToValue.getConfig('b', {
      'a': 100
    })
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: nest key', () => {
    const result = typeToValue.getConfig('a', {
      'a.b': 100
    })
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: multi nest key', () => {
    const result = typeToValue.getConfig('a', {
      'a.b': 100,
      'a.c': 100,
    })
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: replace value 1', () => {
    const result = typeToValue.run('test/dts/config.d.ts', 'ConfigObject', {
      'a': 'test3'
    })
    expect(result.a).toBe('test3')
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: replace value 2', () => {
    const result = typeToValue.run('test/dts/config.d.ts', 'ConfigObject', {
      'a.d': 'test3'
    })
    expect(result.a.d).toBe('test3')
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: replace value 3', () => {
    const result = typeToValue.run('test/dts/config.d.ts', 'ConfigObject', {
      'a.d': { f: 100 },
      'b.c': 'test2',
    })
    expect(result.a.d).toEqual({ f: 100 })
    expect(result.b.c).toBe('test2')
    expect(result).toMatchSnapshot()
  })
  test('config convert correctly :: replace value 4 :: outerObject', () => {
    const result = typeToValue.run('test/dts/config.d.ts', 'ConfigObject', {
      'z.x.p': 111
    })
    expect(result.z.x.p).toEqual(111)
    expect(result).toMatchSnapshot()
  })
})