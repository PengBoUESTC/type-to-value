'use strict'

var tsMorph = require('ts-morph')
var node_process = require('node:process')
var node_path = require('node:path')

let instanceCache = {};
const dropInsCache = (key) => {
    if (!key) {
        instanceCache = {};
    }
    else {
        delete instanceCache[key];
    }
    return;
};
let convertCache = {};
const dropConvertCache = (key) => {
    if (!key) {
        convertCache = {};
    }
    else {
        delete convertCache[key];
    }
    return;
};
const genCacheKey = (options) => {
    const { sourceFilePath, tsConfigFilePath = '' } = options;
    return `${sourceFilePath}_${tsConfigFilePath}`;
};
const genConvertCacheKey = (path, typeValue) => {
    return `${path}_${typeValue}`;
};
const setCache = (options, instance) => {
    const key = genCacheKey(options);
    instanceCache[key] = instance;
    return instance;
};
const setConvertCache = (path, typeValue, value) => {
    convertCache[genConvertCacheKey(path, typeValue)] = value;
    return value;
};
const getCache = (options) => {
    const cacheKey = genCacheKey(options);
    const instance = instanceCache[cacheKey];
    if (!instance) {
        return setCache(options, new TypeToValue(Object.assign(Object.assign({}, options), { cache: false })));
    }
    return instance;
};
const getConvertCache = (path, typeValue) => {
    return convertCache[genConvertCacheKey(path, typeValue)];
};
const createTypeToValue = (options) => {
    const { cache } = options;
    if (cache) {
        return getCache(options);
    }
    return new TypeToValue(options);
};
class TypeToValue {
    constructor(options) {
        this.sourceFileCache = {};
        this.typeKeyCount = {};
        this.project = null;
        if (options.cache) {
            return createTypeToValue(options);
        }
        this.sourceFileCache = {};
        this.typeKeyCount = {};
        this.project = this.init(options);
    }
    get keyCount() {
        return this.typeKeyCount;
    }
    get sourceFilesPaths() {
        const result = {};
        Object.entries(this.sourceFileCache).map(([key, sourceFile]) => {
            result[key] = sourceFile.getFilePath();
        });
        return result;
    }
    get sourceFiles() {
        return this.sourceFileCache;
    }
    init(options) {
        const { sourceFilePath, tsConfigFilePath = node_path.join(node_process.cwd(), 'tsconfig.json') } = options;
        const project = new tsMorph.Project({
            tsConfigFilePath,
        });
        project.addSourceFilesAtPaths(sourceFilePath);
        const tsFiles = project.getDirectories().map(d => d.getSourceFiles().map(s => s.getFilePath())).filter(item => item.length).flat(1);
        tsFiles.forEach(tsFile => {
            const sourceFiletest = project.getSourceFile(tsFile);
            if (!sourceFiletest)
                return;
            const interfaceList = sourceFiletest.getInterfaces();
            const typeAliases = sourceFiletest.getTypeAliases();
            const enums = sourceFiletest.getEnums();
            const list = [...interfaceList, ...typeAliases, ...enums];
            if (list.length) {
                list.forEach(inter => {
                    const name = inter.getName();
                    this.typeKeyCount[name] = (this.typeKeyCount[name] || 0) + 1;
                    this.sourceFileCache[`${name}-${this.typeKeyCount[name]}`] = inter.getSourceFile();
                });
            }
        });
        return project;
    }
    generateValue(type, config) {
        var _a;
        if (type.isUndefined()) {
            return undefined;
        }
        if (type.isNull()) {
            return null;
        }
        if (type.isLiteral()) {
            return this.genLiteralValue(type);
        }
        if (type.isString()) {
            return 'string';
        }
        if (type.isBigInt()) {
            return BigInt('9007199254740991');
        }
        if (type.isNumber()) {
            return 0;
        }
        if (type.isBoolean()) {
            return true;
        }
        if (type.isEnum()) {
            return this.genEnum((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.getDeclarations()[0].asKindOrThrow(tsMorph.SyntaxKind.EnumDeclaration));
        }
        if (type.isUnion()) {
            const unionTypes = type.getUnionTypes();
            return this.generateValue(unionTypes.find(t => !t.isUndefined()) || unionTypes[0]);
        }
        if (type.isArray()) {
            const elementType = type.getArrayElementTypeOrThrow();
            return [this.generateValue(elementType)];
        }
        if (type.isTuple()) {
            const tupleElements = type.getTupleElements();
            return tupleElements.map(element => this.generateValue(element));
        }
        if (type.isObject()) {
            return this.genInnerObject(type, config);
        }
        if (type.isVoid()) {
            return void 0;
        }
        if (type.isUnknown()) {
            return {};
        }
        if (type.getText() === 'symbol') {
            return Symbol('symbol');
        }
        const properties = type.getProperties();
        if (!properties.length) {
            return this.genOuterObject(type, config);
        }
        return null;
    }
    return type.getLiteralValue()
  }
  genEnum(enumDeclaration) {
    if (!enumDeclaration)
      return
    const members = enumDeclaration.getMembers()
    if (!members.length)
      return
    return members[0].getValue()
  }
  genInnerObject(type, config) {
    const value = {}
    const properties = type.getProperties()
    properties.forEach(prop => {
      const name = prop.getName()
      if (config && config.hasOwnProperty(name)) {
        value[name] = config[name]
      }
      else {
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
  genOuterObject(type, config) {
    var _a
    const name = type.getText()
    for (let i = 1; i <= this.typeKeyCount[name]; i++) {
      const sourceFile = this.sourceFileCache[`${name}-${i}`]
      if (sourceFile) {
        const interfaceDeclaration = (_a = (sourceFile.getInterface(name) || sourceFile.getTypeAlias(name) || sourceFile.getEnum(name))) === null || _a === void 0 ? void 0 : _a.getType()
        if (interfaceDeclaration) {
          return this.generateValue(interfaceDeclaration, config)
        }
        return {};
    }
    getConfig(leadKey, config) {
        if (!config)
            return config;
        const nextConfig = {};
        let isEmpty = true;
        Object.keys(config).forEach(key => {
            if (!key)
                return;
            const keys = key.split('.');
            if (keys[0] !== leadKey)
                return;
            const nextKey = keys.slice(1).join('.');
            if (!nextKey)
                return;
            isEmpty = false;
            nextConfig[nextKey] = config[key];
        });
        if (isEmpty)
            return undefined;
        return nextConfig;
    }
    runBase(interfaceDeclaration, config) {
        if (!interfaceDeclaration)
            return {};
        return this.generateValue(interfaceDeclaration.getType(), config);
    }
    run(path, typeValue, config) {
        var _a;
        const sourceFile = (_a = this.project) === null || _a === void 0 ? void 0 : _a.getSourceFile(path);
        if (!sourceFile)
            return null;
        return this.runBase(sourceFile.getInterface(typeValue) || sourceFile.getTypeAlias(typeValue), config);
    }
    runWithCache(path, typeValue, config) {
        const cacheResult = getConvertCache(path, typeValue);
        if (cacheResult)
            return cacheResult;
        const result = this.run(path, typeValue, config);
        setConvertCache(path, typeValue, result);
        return result;
    }
}

exports.TypeToValue = TypeToValue;
exports.createTypeToValue = createTypeToValue;
exports.dropConvertCache = dropConvertCache;
exports.dropInsCache = dropInsCache;
exports.genCacheKey = genCacheKey;
exports.genConvertCacheKey = genConvertCacheKey;
