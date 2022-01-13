import { DMMF } from '@prisma/generator-helper';
export interface Model extends DMMF.Model {
    output: {
        dto: string;
        entity: string;
    };
}
export interface ParsedField {
    kind: DMMF.FieldKind | 'relation-input';
    name: string;
    type: string;
    documentation?: string;
    isRequired: boolean;
    isList: boolean;
    isNullable?: boolean;
}
export interface ExtraModel {
    originalName: string;
    preAndPostfixedName: string;
    isLocal?: boolean;
}
export interface ImportStatementParams {
    from: string;
    default?: string | {
        '*': string;
    };
    destruct?: (string | Record<string, string>)[];
}
export interface DtoParams {
    model: DMMF.Model;
    fields: ParsedField[];
    imports: ImportStatementParams[];
}
export declare type ConnectDtoParams = Omit<DtoParams, 'imports'>;
export interface CreateDtoParams extends DtoParams {
    extraClasses: string[];
    apiExtraModels: string[];
}
export interface UpdateDtoParams extends DtoParams {
    extraClasses: string[];
    apiExtraModels: string[];
}
export interface EntityParams extends DtoParams {
    apiExtraModels: string[];
}
export interface ModelParams {
    connect: ConnectDtoParams;
    create: CreateDtoParams;
    update: UpdateDtoParams;
    entity: EntityParams;
}
export declare type WriteableFileSpecs = {
    fileName: string;
    content: string;
};
