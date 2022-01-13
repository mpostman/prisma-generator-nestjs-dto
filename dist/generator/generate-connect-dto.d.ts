import type { TemplateHelpers } from './template-helpers';
import type { ConnectDtoParams } from './types';
interface GenerateConnectDtoParam extends ConnectDtoParams {
    templateHelpers: TemplateHelpers;
}
export declare const generateConnectDto: ({ model, fields, templateHelpers: t, }: GenerateConnectDtoParam) => string;
export {};
