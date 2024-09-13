import { TypeToValue } from '../lib/index'
import { T } from './dts/enum'
import { F } from './dts/enum2'
const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/enum*.ts'
})

describe('enum test', () => {
  const result = typeToValue.run('test/dts/enum.ts', 'DataEnum')
  const result2 = typeToValue.run('test/dts/enum.ts', 'DataEnum2')
  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('sourceFiles cache correctly', () => {
    expect(typeToValue.sourceFiles).toHaveProperty('DataEnum-1')
  })
  test('DataEnum value convert success', () => {
    expect(result).toMatchSnapshot()
  })
  test('DataEnum2 value convert success', () => {
    expect(result2).toMatchSnapshot()
  })
  test('non <Literal> value', () => {
    expect(result.a).toBe(T.a)
  })
  test('<Literal> value', () => {
    expect(result.b).toBe(T.b)
  })
})