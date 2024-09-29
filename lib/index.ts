import {
  Project,
  type SourceFile,
  SyntaxKind,
  type Type,
  ts,
  type InterfaceDeclaration,
  type TypeAliasDeclaration,
  type EnumDeclaration,
} from 'ts-morph'
import { cwd } from 'node:process'
import { join } from 'node:path'

interface Options {
  /** cache TypeToValue instance or not */
  cache?: boolean
  /** file path need to parse */
  sourceFilePath: string
  /** ts confing file path */
  tsConfigFilePath?: string
}

interface ConvertConfig {
  [path: string]: any
}

let instanceCache: Record<string, TypeToValue> = {}

export const dropInsCache = (key?: string) => {
  if (!key) {
    instanceCache = {}
  } else {
    delete instanceCache[key]
  }
  if (process.env.BUILD) return
  return instanceCache
}

let convertCache: Record<string, any> = {}

export const dropConvertCache = (key?: string) => {
  if (!key) {
    convertCache = {}
  } else {
    delete convertCache[key]
  }
  if (process.env.BUILD) return
  return convertCache
}

export const genCacheKey = (options: Options): string => {
  const { sourceFilePath, tsConfigFilePath = '' } = options
  return `${sourceFilePath}_${tsConfigFilePath}`
}

export const genConvertCacheKey = (path: string, typeValue: string) => {
  return `${path}_${typeValue}`
}

const setCache = (options: Options, instance: TypeToValue): TypeToValue => {
  const key = genCacheKey(options)
  instanceCache[key] = instance
  return instance
}

const setConvertCache = (path: string, typeValue: string, value: any) => {
  convertCache[genConvertCacheKey(path, typeValue)] = value
  return value
}

const getCache = (options: Options) => {
  const cacheKey = genCacheKey(options)
  const instance = instanceCache[cacheKey]
  if (!instance) {
    return setCache(options, new TypeToValue({ ...options, cache: false }))
  }

  return instance
}

const getConvertCache = (path: string, typeValue: string) => {
  return convertCache[genConvertCacheKey(path, typeValue)]
}

export const createTypeToValue = (options: Options) => {
  const { cache } = options
  if (cache) {
    return getCache(options)
  }
  return new TypeToValue(options)
}

export class TypeToValue {
  private sourceFileCache: Record<string, SourceFile> = {}
  private typeKeyCount: Record<string, number> = {}
  project: Project | null = null
  constructor(options: Options) {
    if (options.cache) {
      return createTypeToValue(options)
    }
    this.sourceFileCache = {}
    this.typeKeyCount = {}
    this.project = this.init(options)
  }

  get keyCount() {
    return this.typeKeyCount
  }

  get sourceFilesPaths() {
    const result: Record<string, string> = {}
    Object.entries(this.sourceFileCache).map(([key, sourceFile]) => {
      result[key] = sourceFile.getFilePath()
    })

    return result
  }

  get sourceFiles() {
    return this.sourceFileCache
  }

  init(options: Options) {
    const { sourceFilePath, tsConfigFilePath = join(cwd(), 'tsconfig.json') } =
      options
    const project = new Project({
      tsConfigFilePath,
    })
    project.addSourceFilesAtPaths(sourceFilePath)
    const tsFiles = project
      .getDirectories()
      .map((d) => d.getSourceFiles().map((s) => s.getFilePath()))
      .filter((item) => item.length)
      .flat(1)

    tsFiles.forEach((tsFile) => {
      const sourceFiletest = project.getSourceFile(tsFile)
      if (!sourceFiletest) return
      const interfaceList = sourceFiletest.getInterfaces()
      const typeAliases = sourceFiletest.getTypeAliases()
      const enums = sourceFiletest.getEnums()
      const list = [...interfaceList, ...typeAliases, ...enums]
      if (list.length) {
        list.forEach((inter) => {
          const name = inter.getName()
          this.typeKeyCount[name] = (this.typeKeyCount[name] || 0) + 1

          this.sourceFileCache[`${name}-${this.typeKeyCount[name]}`] =
            inter.getSourceFile()
        })
      }
    })

    return project
  }

  generateValue(type: Type<ts.Type>, config?: ConvertConfig): any {
    if (type.isUndefined()) {
      return undefined
    }
    if (type.isNull()) {
      return null
    }

    if (type.isLiteral()) {
      return this.genLiteralValue(type)
    }

    if (type.isString()) {
      return 'string'
    }

    if (type.isBigInt()) {
      return BigInt('9007199254740991')
    }

    if (type.isNumber()) {
      return 0
    }
    if (type.isBoolean()) {
      return true
    }
    if (type.isEnum()) {
      return this.genEnum(
        type
          .getSymbol()
          ?.getDeclarations()[0]
          .asKindOrThrow(SyntaxKind.EnumDeclaration),
      )
    }
    if (type.isUnion()) {
      const unionTypes = type.getUnionTypes()
      return this.generateValue(
        unionTypes.find((t) => !t.isUndefined()) || unionTypes[0],
      )
    }
    if (type.isArray()) {
      const elementType = type.getArrayElementTypeOrThrow()
      return [this.generateValue(elementType)]
    }
    if (type.isTuple()) {
      const tupleElements = type.getTupleElements()
      return tupleElements.map((element) => this.generateValue(element))
    }
    if (type.isObject()) {
      return this.genInnerObject(type, config)
    }
    if (type.isVoid()) {
      return void 0
    }
    if (type.isUnknown()) {
      return {}
    }

    // handle symbol type
    if (type.getText() === 'symbol') {
      return Symbol('symbol')
    }
    const properties = type.getProperties()
    // 由外部导入的数据类型
    if (!properties.length) {
      return this.genOuterObject(type, config)
    }

    return null
  }

  genLiteralValue(type: Type<ts.Type>) {
    if (type.isBooleanLiteral()) {
      // 获取布尔字面量的值
      return type.getText() === 'true'
    }
    return type.getLiteralValue()
  }

  genEnum(enumDeclaration?: EnumDeclaration) {
    if (!enumDeclaration) return
    const members = enumDeclaration.getMembers()
    if (!members.length) return
    return members[0].getValue()
  }

  genInnerObject(type: Type<ts.Type>, config?: ConvertConfig) {
    const value: any = {}
    const properties = type.getProperties()
    properties.forEach((prop) => {
      const name = prop.getName()
      if (config && config.hasOwnProperty(name)) {
        value[name] = config[name]
      } else {
        const t = prop.getDeclarations()[0]
        if (!t) {
          return
        }
        const propType = prop.getTypeAtLocation(t)
        value[name] = this.generateValue(propType, this.getConfig(name, config))
      }
    })
    return value
  }

  genOuterObject(type: Type<ts.Type>, config?: ConvertConfig) {
    const name = type.getText()
    // 当 没有找到 正确的类型文件时，会全局找到 ts 文件中声明的类型作为 兜底补充
    // 正常场景不会走到 这种场景
    for (let i = 1; i <= this.typeKeyCount[name]; i++) {
      const sourceFile = this.sourceFileCache[`${name}-${i}`]
      if (sourceFile) {
        const interfaceDeclaration = (
          sourceFile.getInterface(name) ||
          sourceFile.getTypeAlias(name) ||
          sourceFile.getEnum(name)
        )?.getType()
        if (interfaceDeclaration) {
          return this.generateValue(interfaceDeclaration, config)
        }
      }
    }
    return {}
  }

  getConfig(leadKey: string, config?: ConvertConfig) {
    if (!config) return config
    const nextConfig: Record<string, any> = {}
    let isEmpty = true
    Object.keys(config).forEach((key) => {
      if (!key) return
      const keys = key.split('.')
      if (keys[0] !== leadKey) return
      const nextKey = keys.slice(1).join('.')
      if (!nextKey) return
      isEmpty = false
      nextConfig[nextKey] = config[key]
    })
    if (isEmpty) return undefined
    return nextConfig
  }

  runBase(
    interfaceDeclaration?: InterfaceDeclaration | TypeAliasDeclaration,
    config?: ConvertConfig,
  ) {
    if (!interfaceDeclaration) return {}
    return this.generateValue(interfaceDeclaration.getType(), config)
  }

  run(path: string, typeValue: string, config?: ConvertConfig) {
    const sourceFile = this.project?.getSourceFile(path)
    if (!sourceFile) return null
    return this.runBase(
      sourceFile.getInterface(typeValue) || sourceFile.getTypeAlias(typeValue),
      config,
    )
  }

  runWithCache(path: string, typeValue: string, config?: ConvertConfig) {
    const cacheResult = getConvertCache(path, typeValue)
    if (cacheResult) return cacheResult
    const result = this.run(path, typeValue, config)
    setConvertCache(path, typeValue, result)
    return result
  }

  runWithCopy(path: string, typeValue: string, config?: ConvertConfig) {
    const result = this.runWithCache(path, typeValue, config)

    return JSON.parse(JSON.stringify(result))
  }
}
