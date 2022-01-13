"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.stringToBoolean = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path = __importStar(require("path"));
const make_dir_1 = __importDefault(require("make-dir"));
const generator_helper_1 = require("@prisma/generator-helper");
const sdk_1 = require("@prisma/sdk");
const generator_1 = require("./generator");
const stringToBoolean = (input, defaultValue = false) => {
    if (input === 'true') {
        return true;
    }
    if (input === 'false') {
        return false;
    }
    return defaultValue;
};
exports.stringToBoolean = stringToBoolean;
const generate = (options) => {
    const output = (0, sdk_1.parseEnvValue)(options.generator.output);
    const { connectDtoPrefix = 'Connect', createDtoPrefix = 'Create', updateDtoPrefix = 'Update', dtoSuffix = 'Dto', entityPrefix = '', entitySuffix = '', } = options.generator.config;
    const exportRelationModifierClasses = (0, exports.stringToBoolean)(options.generator.config.exportRelationModifierClasses, true);
    const outputToNestJsResourceStructure = (0, exports.stringToBoolean)(options.generator.config.outputToNestJsResourceStructure, false);
    const reExport = (0, exports.stringToBoolean)(options.generator.config.reExport, false);
    const results = (0, generator_1.run)({
        output,
        dmmf: options.dmmf,
        exportRelationModifierClasses,
        outputToNestJsResourceStructure,
        connectDtoPrefix,
        createDtoPrefix,
        updateDtoPrefix,
        dtoSuffix,
        entityPrefix,
        entitySuffix,
    });
    const indexCollections = {};
    if (reExport) {
        results.forEach(({ fileName }) => {
            const dirName = path.dirname(fileName);
            const { [dirName]: fileSpec } = indexCollections;
            indexCollections[dirName] = {
                fileName: (fileSpec === null || fileSpec === void 0 ? void 0 : fileSpec.fileName) || path.join(dirName, 'index.ts'),
                content: [
                    (fileSpec === null || fileSpec === void 0 ? void 0 : fileSpec.content) || '',
                    `export * from './${path.basename(fileName, '.ts')}';`,
                ].join('\n'),
            };
        });
    }
    return Promise.all(results
        .concat(Object.values(indexCollections))
        .map(async ({ fileName, content }) => {
        await (0, make_dir_1.default)(path.dirname(fileName));
        return promises_1.default.writeFile(fileName, content);
    }));
};
exports.generate = generate;
(0, generator_helper_1.generatorHandler)({
    onManifest: () => ({
        defaultOutput: '../src/generated/nestjs-dto',
        prettyName: 'NestJS DTO Generator',
    }),
    onGenerate: exports.generate,
});
