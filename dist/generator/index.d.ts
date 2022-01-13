import type { DMMF } from '@prisma/generator-helper';
import { WriteableFileSpecs } from './types';
interface RunParam {
    output: string;
    dmmf: DMMF.Document;
    exportRelationModifierClasses: boolean;
    outputToNestJsResourceStructure: boolean;
    connectDtoPrefix: string;
    createDtoPrefix: string;
    updateDtoPrefix: string;
    dtoSuffix: string;
    entityPrefix: string;
    entitySuffix: string;
}
export declare const run: ({ output, dmmf, ...options }: RunParam) => WriteableFileSpecs[];
export {};
