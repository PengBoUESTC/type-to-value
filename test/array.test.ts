import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/array*.d.ts'
})

describe('array test', () => {
  const result = typeToValue.run('test/dts/array.d.ts', 'ArrayData')
  const result2 = typeToValue.run('test/dts/array.d.ts', 'ArrayData2')
  const result3 = typeToValue.run('test/dts/array.d.ts', 'ArrayData3')
  test('ArrayData value convert success', () => {
    expect(result).toMatchSnapshot()
  })
  test('ArrayData2 value convert success', () => {
    expect(result2).toMatchSnapshot()
  })

  test('ArrayData3 value convert success', () => {
    expect(result3).toMatchSnapshot()
  })
})