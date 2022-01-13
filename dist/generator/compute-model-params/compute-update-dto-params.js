"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUpdateDtoParams = void 0;
const annotations_1 = require("../annotations");
const field_classifiers_1 = require("../field-classifiers");
const helpers_1 = require("../helpers");
const computeUpdateDtoParams = ({ model, allModels, templateHelpers, }) => {
    let hasEnum = false;
    const imports = [];
    const extraClasses = [];
    const apiExtraModels = [];
    const relationScalarFields = (0, helpers_1.getRelationScalars)(model.fields);
    const relationScalarFieldNames = Object.keys(relationScalarFields);
    const fields = model.fields.reduce((result, field) => {
        const { name } = field;
        const overrides = { isRequired: false };
        if ((0, field_classifiers_1.isReadOnly)(field))
            return result;
        if ((0, field_classifiers_1.isRelation)(field)) {
            if (!(0, field_classifiers_1.isAnnotatedWithOneOf)(field, annotations_1.DTO_RELATION_MODIFIERS_ON_UPDATE)) {
                return result;
            }
            const relationInputType = (0, helpers_1.generateRelationInput)({
                field,
                model,
                allModels,
                templateHelpers,
                preAndSuffixClassName: templateHelpers.updateDtoName,
                canCreateAnnotation: annotations_1.DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
                canConnectAnnotation: annotations_1.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
            });
            overrides.type = relationInputType.type;
            overrides.isList = false;
            (0, helpers_1.concatIntoArray)(relationInputType.imports, imports);
            (0, helpers_1.concatIntoArray)(relationInputType.generatedClasses, extraClasses);
            (0, helpers_1.concatIntoArray)(relationInputType.apiExtraModels, apiExtraModels);
        }
        if (relationScalarFieldNames.includes(name))
            return result;
        const isDtoOptional = (0, field_classifiers_1.isAnnotatedWith)(field, annotations_1.DTO_UPDATE_OPTIONAL);
        if (!isDtoOptional) {
            if ((0, field_classifiers_1.isId)(field))
                return result;
            if ((0, field_classifiers_1.isUpdatedAt)(field))
                return result;
            if ((0, field_classifiers_1.isRequiredWithDefaultValue)(field))
                return result;
        }
        if (field.kind === 'enum')
            hasEnum = true;
        return [...result, (0, helpers_1.mapDMMFToParsedField)(field, overrides)];
    }, []);
    if (apiExtraModels.length || hasEnum) {
        const destruct = [];
        if (apiExtraModels.length)
            destruct.push('ApiExtraModels');
        if (hasEnum)
            destruct.push('ApiProperty');
        imports.unshift({ from: '@nestjs/swagger', destruct });
    }
    const importPrismaClient = (0, helpers_1.makeImportsFromPrismaClient)(fields);
    if (importPrismaClient)
        imports.unshift(importPrismaClient);
    return {
        model,
        fields,
        imports: (0, helpers_1.zipImportStatementParams)(imports),
        extraClasses,
        apiExtraModels,
    };
};
exports.computeUpdateDtoParams = computeUpdateDtoParams;
