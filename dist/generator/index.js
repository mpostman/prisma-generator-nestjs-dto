"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const path_1 = __importDefault(require("path"));
const case_1 = require("case");
const sdk_1 = require("@prisma/sdk");
const template_helpers_1 = require("./template-helpers");
const compute_model_params_1 = require("./compute-model-params");
const generate_connect_dto_1 = require("./generate-connect-dto");
const generate_create_dto_1 = require("./generate-create-dto");
const generate_update_dto_1 = require("./generate-update-dto");
const generate_entity_1 = require("./generate-entity");
const annotations_1 = require("./annotations");
const field_classifiers_1 = require("./field-classifiers");
const run = ({ output, dmmf, ...options }) => {
    const { exportRelationModifierClasses, outputToNestJsResourceStructure, ...preAndSuffixes } = options;
    const templateHelpers = (0, template_helpers_1.makeHelpers)({
        transformFileNameCase: case_1.camel,
        transformClassNameCase: case_1.pascal,
        ...preAndSuffixes,
    });
    const allModels = dmmf.datamodel.models;
    const filteredModels = allModels
        .filter((model) => !(0, field_classifiers_1.isAnnotatedWith)(model, annotations_1.DTO_IGNORE_MODEL))
        .map((model) => ({
        ...model,
        output: {
            dto: outputToNestJsResourceStructure
                ? path_1.default.join(output, (0, case_1.camel)(model.name), 'dto')
                : output,
            entity: outputToNestJsResourceStructure
                ? path_1.default.join(output, (0, case_1.camel)(model.name), 'entities')
                : output,
        },
    }));
    const modelFiles = filteredModels.map((model) => {
        sdk_1.logger.info(`Processing Model ${model.name}`);
        const modelParams = (0, compute_model_params_1.computeModelParams)({
            model,
            allModels: filteredModels,
            templateHelpers,
        });
        const connectDto = {
            fileName: path_1.default.join(model.output.dto, templateHelpers.connectDtoFilename(model.name, true)),
            content: (0, generate_connect_dto_1.generateConnectDto)({
                ...modelParams.connect,
                templateHelpers,
            }),
        };
        const createDto = {
            fileName: path_1.default.join(model.output.dto, templateHelpers.createDtoFilename(model.name, true)),
            content: (0, generate_create_dto_1.generateCreateDto)({
                ...modelParams.create,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const updateDto = {
            fileName: path_1.default.join(model.output.dto, templateHelpers.updateDtoFilename(model.name, true)),
            content: (0, generate_update_dto_1.generateUpdateDto)({
                ...modelParams.update,
                exportRelationModifierClasses,
                templateHelpers,
            }),
        };
        const entity = {
            fileName: path_1.default.join(model.output.entity, templateHelpers.entityFilename(model.name, true)),
            content: (0, generate_entity_1.generateEntity)({
                ...modelParams.entity,
                templateHelpers,
            }),
        };
        return [connectDto, createDto, updateDto, entity];
    });
    return [...modelFiles].flat();
};
exports.run = run;
