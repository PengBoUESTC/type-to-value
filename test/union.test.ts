import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/union*.d.ts'
})

describe('union test', () => {
  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  const result = typeToValue.run('test/dts/union.d.ts', 'UnionData')
  const result2 = typeToValue.run('test/dts/union.d.ts', 'UnionData2')

  test('UnionData value convert success', () => {
    expect(result).toMatchSnapshot()
  })
  
  test('UnionData2 value convert success', () => {
    expect(result2).toMatchSnapshot()
  })
})