import type { DMMF } from '@prisma/generator-helper';
import type { ConnectDtoParams } from '../types';
interface ComputeConnectDtoParamsParam {
    model: DMMF.Model;
}
export declare const computeConnectDtoParams: ({ model, }: ComputeConnectDtoParamsParam) => ConnectDtoParams;
export {};
