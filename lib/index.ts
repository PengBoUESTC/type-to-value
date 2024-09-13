import { Project, type SourceFile, SyntaxKind, type Type, ts, type InterfaceDeclaration, type TypeAliasDeclaration, type EnumDeclaration } from 'ts-morph';
import { cwd } from 'node:process'
import { join } from 'node:path'

interface Options {
  sourceFilePath: string
}

export class TypeToValue {
  private sourceFileCache: Record<string, SourceFile> = {}
  private typeKeyCount: Record<string, number> = {}
  project: Project
  constructor(options: Options) {
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
    const { sourceFilePath } = options
    const project = new Project({
      tsConfigFilePath: join(cwd(), 'tsconfig.json')
    })
    project.addSourceFilesAtPaths(sourceFilePath)
    const tsFiles = project.getDirectories().map(d => d.getSourceFiles().map(s => s.getFilePath())).filter(item => item.length).flat(1)
  
    tsFiles.forEach(tsFile => {
      const sourceFiletest = project.getSourceFile(tsFile)
      if (!sourceFiletest) return
      const interfaceList = sourceFiletest.getInterfaces()
      const typeAliases = sourceFiletest.getTypeAliases()
      const enums = sourceFiletest.getEnums()
      const list = [...interfaceList, ...typeAliases, ...enums]
      if (list.length) {
        list.forEach(inter => {
          const name = inter.getName()
          this.typeKeyCount[name] = (this.typeKeyCount[name] || 0) + 1
    
          this.sourceFileCache[`${name}-${this.typeKeyCount[name]}`] = inter.getSourceFile()
        })
      }
    })
  
    return project
  }

  generateValue(type: Type<ts.Type>): any {
    const properties = type.getProperties()
    if (type.isUndefined()) {
      return undefined
    }
    if (type.isNull()) {
      return null
    }

    if (type.isLiteral()) {
      return this.genLiteralValue(type)
    }
    
    // 由外部导入的数据类型
    if (!properties.length) {
      return this.genOuterObject(type)
    }

    if (type.isString()) {
      return 'string'
    } else if (type.isNumber()) {
      return 0
    } else if (type.isBoolean()) {
      return true
    } else if (type.isArray()) {
      const elementType = type.getArrayElementTypeOrThrow()
      return [this.generateValue(elementType)]
    } else if (type.isTuple()) {
      const tupleElements = type.getTupleElements()
      return tupleElements.map(element => this.generateValue(element))
    }else if (type.isObject()) {
      return this.genInnerObject(type)
    } else if (type.isEnum()) {
      return this.genEnum(type.getSymbol()?.getDeclarations()[0].asKindOrThrow(SyntaxKind.EnumDeclaration))
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

  genInnerObject(type: Type<ts.Type>) {
    const value: any = {}
    const properties = type.getProperties()
  
    properties.forEach(prop => {
      const t = prop.getValueDeclaration()
      if (t) {
        const propType = prop.getTypeAtLocation(t)
        value[prop.getName()] = this.generateValue(propType)
      }
    })
    return value
  }

  genOuterObject(type: Type<ts.Type>) {
    const name = type.getText()
    // 当 没有找到 正确的类型文件时，会全局找到 ts 文件中声明的类型作为 兜底补充
    // 正常场景不会走到 这种场景
    for(let i = 1; i <= this.typeKeyCount[name]; i ++) {
      const sourceFile = this.sourceFileCache[`${name}-${i}`]
      if (sourceFile) {
        const interfaceDeclaration = (sourceFile.getInterface(name) || sourceFile.getTypeAlias(name) || sourceFile.getEnum(name))?.getType()
        if (interfaceDeclaration) {
          return this.generateValue(interfaceDeclaration)
        }
      }
    }
    return {}
  }

  runBase(interfaceDeclaration?: InterfaceDeclaration | TypeAliasDeclaration) {
    if (!interfaceDeclaration) return {}
    return this.generateValue(interfaceDeclaration.getType())
  }

  run(path: string, typeValue: string) {
    const sourceFile = this.project.getSourceFile(path)
    if (!sourceFile) return null
    return this.runBase(sourceFile.getInterface(typeValue) || sourceFile.getTypeAlias(typeValue))
  }
}
