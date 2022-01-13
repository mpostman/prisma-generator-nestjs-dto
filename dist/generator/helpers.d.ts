import type { DMMF } from '@prisma/generator-helper';
import type { TemplateHelpers } from './template-helpers';
import type { ImportStatementParams, Model, ParsedField } from './types';
export declare const uniq: <T = any>(input: T[]) => T[];
export declare const concatIntoArray: <T = any>(source: T[], target: T[]) => void;
export declare const makeImportsFromPrismaClient: (fields: ParsedField[]) => ImportStatementParams | null;
export declare const mapDMMFToParsedField: (field: DMMF.Field, overrides?: Partial<DMMF.Field>) => ParsedField;
export declare const getRelationScalars: (fields: DMMF.Field[]) => Record<string, string[]>;
interface GetRelationConnectInputFieldsParam {
    field: DMMF.Field;
    allModels: DMMF.Model[];
}
export declare const getRelationConnectInputFields: ({ field, allModels, }: GetRelationConnectInputFieldsParam) => Set<DMMF.Field>;
export declare const getRelativePath: (from: string, to: string) => string;
interface GenerateRelationInputParam {
    field: DMMF.Field;
    model: Model;
    allModels: Model[];
    templateHelpers: TemplateHelpers;
    preAndSuffixClassName: TemplateHelpers['createDtoName'] | TemplateHelpers['updateDtoName'];
    canCreateAnnotation: RegExp;
    canConnectAnnotation: RegExp;
}
export declare const generateRelationInput: ({ field, model, allModels, templateHelpers: t, preAndSuffixClassName, canCreateAnnotation, canConnectAnnotation, }: GenerateRelationInputParam) => {
    type: string;
    imports: ImportStatementParams[];
    generatedClasses: string[];
    apiExtraModels: string[];
};
export declare const mergeImportStatements: (first: ImportStatementParams, second: ImportStatementParams) => ImportStatementParams;
export declare const zipImportStatementParams: (items: ImportStatementParams[]) => ImportStatementParams[];
export {};
