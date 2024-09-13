import { Project, type SourceFile, type Type, ts, type InterfaceDeclaration, type TypeAliasDeclaration, type EnumDeclaration } from 'ts-morph';
interface Options {
    sourceFilePath: string;
}
export declare class TypeToValue {
    private sourceFileCache;
    private typeKeyCount;
    project: Project;
    constructor(options: Options);
    get keyCount(): Record<string, number>;
    get sourceFilesPaths(): Record<string, string>;
    get sourceFiles(): Record<string, SourceFile>;
    init(options: Options): Project;
    generateValue(type: Type<ts.Type>): any;
    genLiteralValue(type: Type<ts.Type>): string | number | boolean | ts.PseudoBigInt | undefined;
    genEnum(enumDeclaration?: EnumDeclaration): string | number | undefined;
    genInnerObject(type: Type<ts.Type>): any;
    genOuterObject(type: Type<ts.Type>): any;
    runBase(interfaceDeclaration?: InterfaceDeclaration | TypeAliasDeclaration): any;
    run(path: string, typeValue: string): any;
}
export {};
