'use strict';

var tsMorph = require('ts-morph');
var node_process = require('node:process');
var node_path = require('node:path');

class TypeToValue {
    constructor(options) {
        this.sourceFileCache = {};
        this.typeKeyCount = {};
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
        const { sourceFilePath } = options;
        const project = new tsMorph.Project({
            tsConfigFilePath: node_path.join(node_process.cwd(), 'tsconfig.json')
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
    generateValue(type) {
        var _a;
        const properties = type.getProperties();
        if (type.isUndefined()) {
            return undefined;
        }
        if (type.isNull()) {
            return null;
        }
        if (type.isLiteral()) {
            return this.genLiteralValue(type);
        }
        if (!properties.length) {
            return this.genOuterObject(type);
        }
        if (type.isString()) {
            return 'string';
        }
        else if (type.isNumber()) {
            return 0;
        }
        else if (type.isBoolean()) {
            return true;
        }
        else if (type.isArray()) {
            const elementType = type.getArrayElementTypeOrThrow();
            return [this.generateValue(elementType)];
        }
        else if (type.isTuple()) {
            const tupleElements = type.getTupleElements();
            return tupleElements.map(element => this.generateValue(element));
        }
        else if (type.isObject()) {
            return this.genInnerObject(type);
        }
        else if (type.isEnum()) {
            return this.genEnum((_a = type.getSymbol()) === null || _a === void 0 ? void 0 : _a.getDeclarations()[0].asKindOrThrow(tsMorph.SyntaxKind.EnumDeclaration));
        }
        return null;
    }
    genLiteralValue(type) {
        if (type.isBooleanLiteral()) {
            return type.getText() === 'true';
        }
        return type.getLiteralValue();
    }
    genEnum(enumDeclaration) {
        if (!enumDeclaration)
            return;
        const members = enumDeclaration.getMembers();
        if (!members.length)
            return;
        return members[0].getValue();
    }
    genInnerObject(type) {
        const value = {};
        const properties = type.getProperties();
        properties.forEach(prop => {
            const t = prop.getValueDeclaration();
            if (t) {
                const propType = prop.getTypeAtLocation(t);
                value[prop.getName()] = this.generateValue(propType);
            }
        });
        return value;
    }
    genOuterObject(type) {
        var _a;
        const name = type.getText();
        for (let i = 1; i <= this.typeKeyCount[name]; i++) {
            const sourceFile = this.sourceFileCache[`${name}-${i}`];
            if (sourceFile) {
                const interfaceDeclaration = (_a = (sourceFile.getInterface(name) || sourceFile.getTypeAlias(name) || sourceFile.getEnum(name))) === null || _a === void 0 ? void 0 : _a.getType();
                if (interfaceDeclaration) {
                    return this.generateValue(interfaceDeclaration);
                }
            }
        }
        return {};
    }
    runBase(interfaceDeclaration) {
        if (!interfaceDeclaration)
            return {};
        return this.generateValue(interfaceDeclaration.getType());
    }
    run(path, typeValue) {
        const sourceFile = this.project.getSourceFile(path);
        if (!sourceFile)
            return null;
        return this.runBase(sourceFile.getInterface(typeValue) || sourceFile.getTypeAlias(typeValue));
    }
}

exports.TypeToValue = TypeToValue;
