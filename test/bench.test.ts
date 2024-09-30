import { Bench } from 'tinybench'
import { createTypeToValue } from '../lib/index'


describe('bench', () => {
  test('createTypeToValue cache bench test', async () => {
    const bench = new Bench({ time: 1500 })
    bench
      .add('createTypeToValue with no cache', () => {
        createTypeToValue({ sourceFilePath: 'test/**/*.d.ts'})
      })
      .add('createTypeToValue with cache', () => {
        createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts'})
      })
    await bench.warmup()
    await bench.run()
    expect(bench.table()).toMatchSnapshot()
    console.table(bench.table())
  })

  test('convert cache bench test', async () => {
    const bench = new Bench({ time: 1500 })
    bench
      .add('convert with no cache', () => {
        const typeValue = createTypeToValue({ sourceFilePath: 'test/**/*.d.ts'})
        typeValue.run('test/dts/index.d.ts', 'Data')
      })
      .add('convert with cache', () => {
        const typeValue = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts'})
        typeValue.runWithCache('test/dts/index.d.ts', 'Data')
      })
      .add('convert with cache & copy', () => {
        const typeValue = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts'})
        typeValue.runWithCopy('test/dts/index.d.ts', 'Data')
      })

    await bench.warmup()
    await bench.run()
    expect(bench.table()).toMatchSnapshot()
    console.table(bench.table())
  })
})