import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/outer*.d.ts'
})

describe('base test', () => {
  const result = typeToValue.run('test/dts/outer2.d.ts', 'DataOuter2')
  
  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('sourceFiles cache correctly', () => {
    expect(typeToValue.sourceFiles).toHaveProperty('DataOuter-1')
  })
  test('DataOuter2 value convert success', () => {
    expect(result).toMatchSnapshot()
  })
})