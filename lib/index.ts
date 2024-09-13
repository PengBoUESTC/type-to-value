import { Project, type SourceFile, SyntaxKind, type Type, ts, type InterfaceDeclaration, type TypeAliasDeclaration, type EnumDeclaration } from 'ts-morph';


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

  get sourceFiles() {
    return this.sourceFileCache
  }

  init(options: Options) {
    const { sourceFilePath } = options
    const project = new Project({})
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
      return [this.genObject(elementType)]
    } else if (type.isObject()) {
      return this.genInnerObject(type)
    } else if (type.isEnum()) {
      return this.genEnum(type.getSymbol()?.getDeclarations()[0].asKindOrThrow(SyntaxKind.EnumDeclaration))
    }
    return null
  }

  genEnum(enumDeclaration?: EnumDeclaration) {
    if (!enumDeclaration) return
    const members = enumDeclaration.getMembers()
    if (!members.length) return
    return members[0].getValue()
  }

  genObject(type: Type<ts.Type>) {
    const properties = type.getProperties()
    if (!properties.length) {
      return this.genOuterObject(type)
    }
    return this.genInnerObject(type)
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
    for(let i = 1; i <= this.typeKeyCount[name]; i ++) {
      const sourceFile = this.sourceFileCache[`${name}-${i}`]
      if (sourceFile) {
        const interfaceType = sourceFile.getInterface(name)
        const typeType = sourceFile.getTypeAlias(name)
        const enumType = sourceFile.getEnum(name)
        if (enumType) {
          return this.genEnum(enumType)
        }
        return this.runBase(interfaceType || typeType)
      }
    }
    return {}
  }

  runBase(interfaceDeclaration?: InterfaceDeclaration | TypeAliasDeclaration) {
    const value: any = {}
    if (!interfaceDeclaration) return {}
  
    interfaceDeclaration.getType().getProperties().forEach(prop => {
      const name = prop.getName()
      const declaration = prop.getValueDeclaration()
      if (!declaration) {
        return prop
      }
      const propType = prop.getTypeAtLocation(declaration)
      value[name] = this.generateValue(propType)
    })
    return value
  }

  run(path: string, typeValue: string) {
    const sourceFile = this.project.getSourceFile(path)
    if (!sourceFile) return null
    const interfaceDeclaration = sourceFile.getInterfaceOrThrow(typeValue)
    const typeAliasDeclaration = sourceFile.getTypeAlias(typeValue)
    return this.runBase(interfaceDeclaration || typeAliasDeclaration)
  }
}
