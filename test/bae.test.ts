import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/*.d.ts'
})

describe('base test', () => {
  test('base test', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('base test', () => {
    expect(typeToValue.sourceFiles).toHaveProperty('Data-1')
  })
  test('base test', () => {
    expect(typeToValue.run('test/dts/index.d.ts', 'Data')).toMatchSnapshot()
  })
})