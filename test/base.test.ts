import { join } from 'node:path'
import { cwd } from 'node:process'
import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/*.d.ts'
})

describe('base test', () => {
  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('sourceFiles cache correctly', () => {
    expect(typeToValue.sourceFiles).toHaveProperty('Data-1')
  })
  test('sourceFilesPaths convert correctly', () => {
    expect(Object.values(typeToValue.sourceFilesPaths)).toContain(join(cwd(), 'test/dts/object.d.ts'))
  })
  test('keyCount cache correctly', () => {
    ['Data', 'DataInner', 'A', 'B', 'LiteralValue'].forEach(key => {
      expect(Object.keys(typeToValue.keyCount)).toContain(`${key}`)
    })
  })
  
  const result = typeToValue.run('test/dts/index.d.ts', 'Data')
  test('Data value convert success', () => {
    expect(result).toMatchSnapshot()
  })
  test('value convert [lost type EmptyInterface]', () => {
    expect(result.c).toEqual({})
  })
})