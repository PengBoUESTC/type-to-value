import { TypeToValue, createTypeToValue, genCacheKey, dropInsCache, genConvertCacheKey, dropConvertCache } from '../lib/index'

describe("cahce test", () => {
  test("createTypeToValue test", () => {
    const instance = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const instance2 = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const instance3 = createTypeToValue({ sourceFilePath: 'test/**/*.d.ts' })
    const instance4 = new TypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    expect(instance2 === instance).toBeTruthy()
    expect(instance3 === instance).toBeFalsy()
    expect(instance4 === instance).toBeTruthy()
  })

  test("dropInsCache test", () => {
    const options = { cache: true, sourceFilePath: 'test/**/*.d.ts' }
    const instance = createTypeToValue(options)
    dropInsCache(genCacheKey(options))
    const instance2 = createTypeToValue(options)
    expect(instance === instance2).toBeFalsy()
  })

  test("runWithCache test", () => {
    const instance = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const run = jest.spyOn(instance, 'run')

    const result = instance.run('test/dts/index.d.ts', 'Data')
    const result2 = instance.run('test/dts/index.d.ts', 'Data')
    expect(run).toHaveBeenCalledTimes(2)
    const resultCache = instance.runWithCache('test/dts/index.d.ts', 'Data')
    const resultCache2 = instance.runWithCache('test/dts/index.d.ts', 'Data')
    expect(run).toHaveBeenCalledTimes(3)
    expect(result === result2).toBeFalsy()
    expect(resultCache === resultCache2).toBeTruthy()
  })

  test("dropConvertCache test", () => {
    const instance = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const resultCache = instance.runWithCache('test/dts/index.d.ts', 'Data')
    dropConvertCache(genConvertCacheKey('test/dts/index.d.ts', 'Data'))
    const resultCache2 = instance.runWithCache('test/dts/index.d.ts', 'Data')
    expect(resultCache === resultCache2).toBeFalsy()
  })

  test("dropInsCache clean test", () => {
    const options = { cache: true, sourceFilePath: 'test/**/*.d.ts' }
    const instance = createTypeToValue(options)
    const instance2 = createTypeToValue({ ...options, sourceFilePath: 'test/**/array.d.ts' })
    const result = dropInsCache(genCacheKey(options))
    expect(result).toMatchSnapshot()
    const result2 = dropInsCache()
    expect(result2).toEqual({})
  })
  test("dropConvertCache clean test", () => {
    const instance = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const resultCache = instance.runWithCache('test/dts/index.d.ts', 'Data')
    const resultCache2 = instance.runWithCache('test/dts/index.d.ts', 'DataCache')
    
    const result = dropConvertCache(genConvertCacheKey('test/dts/index.d.ts', 'Data'))
    expect(result).toMatchSnapshot()
    const result2 = dropConvertCache()
    expect(result2).toEqual({})
  })

  test("runWithCopy test", () => {
    const instance = createTypeToValue({ cache: true, sourceFilePath: 'test/**/*.d.ts' })
    const resultCache = instance.runWithCache('test/dts/index.d.ts', 'Data')
    const resultCopy = instance.runWithCopy('test/dts/index.d.ts', 'Data')
    resultCache.a = -100
    expect(resultCopy).toMatchSnapshot()
    expect(resultCache).toMatchSnapshot()
    expect(resultCopy.a).not.toEqual(-100)
  })
})