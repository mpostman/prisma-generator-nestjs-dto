import type { GeneratorOptions } from '@prisma/generator-helper';
export declare const stringToBoolean: (input: string, defaultValue?: boolean) => boolean;
export declare const generate: (options: GeneratorOptions) => Promise<void[]>;
