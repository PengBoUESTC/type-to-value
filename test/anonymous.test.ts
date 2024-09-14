import { TypeToValue } from '../lib/index'

const typeToValue = new TypeToValue({
  sourceFilePath: 'test/**/anonymous.ts'
})

describe('Anonymous test', () => {
  const result = typeToValue.run('test/dts/anonymous.ts', 'AnonymousType')

  test('project not empty', () => {
    expect(typeToValue.project).toBeTruthy()
  })
  test('AnonymousType convert correctly', () => {
    expect(result).toMatchSnapshot()
  })
})