"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipImportStatementParams = exports.mergeImportStatements = exports.generateRelationInput = exports.getRelativePath = exports.getRelationConnectInputFields = exports.getRelationScalars = exports.mapDMMFToParsedField = exports.makeImportsFromPrismaClient = exports.concatIntoArray = exports.uniq = void 0;
const path_1 = __importDefault(require("path"));
const slash_1 = __importDefault(require("slash"));
const field_classifiers_1 = require("./field-classifiers");
const template_helpers_1 = require("./template-helpers");
const uniq = (input) => Array.from(new Set(input));
exports.uniq = uniq;
const concatIntoArray = (source, target) => source.forEach((item) => target.push(item));
exports.concatIntoArray = concatIntoArray;
const makeImportsFromPrismaClient = (fields) => {
    const enumsToImport = (0, exports.uniq)(fields.filter(({ kind }) => kind === 'enum').map(({ type }) => type));
    const importPrisma = fields
        .filter(({ kind }) => kind === 'scalar')
        .some(({ type }) => (0, template_helpers_1.scalarToTS)(type).includes('Prisma'));
    if (!(enumsToImport.length || importPrisma)) {
        return null;
    }
    return {
        from: '@prisma/client',
        destruct: importPrisma ? ['Prisma', ...enumsToImport] : enumsToImport,
    };
};
exports.makeImportsFromPrismaClient = makeImportsFromPrismaClient;
const mapDMMFToParsedField = (field, overrides = {}) => ({
    ...field,
    ...overrides,
});
exports.mapDMMFToParsedField = mapDMMFToParsedField;
const getRelationScalars = (fields) => {
    const scalars = fields.flatMap(({ relationFromFields = [] }) => relationFromFields);
    return scalars.reduce((result, scalar) => ({
        ...result,
        [scalar]: fields
            .filter(({ relationFromFields = [] }) => relationFromFields.includes(scalar))
            .map(({ name }) => name),
    }), {});
};
exports.getRelationScalars = getRelationScalars;
const getRelationConnectInputFields = ({ field, allModels, }) => {
    const { name, type, relationToFields = [] } = field;
    if (!(0, field_classifiers_1.isRelation)(field)) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Not a relation field.`);
    }
    const relatedModel = allModels.find(({ name: modelName }) => modelName === type);
    if (!relatedModel) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Related model '${type}' unknown.`);
    }
    if (!relationToFields.length) {
        throw new Error(`Can not resolve RelationConnectInputFields for field '${name}'. Foreign keys are unknown.`);
    }
    const foreignKeyFields = relationToFields.map((relationToFieldName) => {
        const relatedField = relatedModel.fields.find((relatedModelField) => relatedModelField.name === relationToFieldName);
        if (!relatedField)
            throw new Error(`Can not find foreign key field '${relationToFieldName}' on model '${relatedModel.name}'`);
        return relatedField;
    });
    const idFields = relatedModel.fields.filter((relatedModelField) => (0, field_classifiers_1.isId)(relatedModelField));
    const uniqueFields = relatedModel.fields.filter((relatedModelField) => (0, field_classifiers_1.isUnique)(relatedModelField));
    const foreignFields = new Set([
        ...foreignKeyFields,
        ...idFields,
        ...uniqueFields,
    ]);
    return foreignFields;
};
exports.getRelationConnectInputFields = getRelationConnectInputFields;
const getRelativePath = (from, to) => {
    const result = (0, slash_1.default)(path_1.default.relative(from, to));
    return result || '.';
};
exports.getRelativePath = getRelativePath;
const generateRelationInput = ({ field, model, allModels, templateHelpers: t, preAndSuffixClassName, canCreateAnnotation, canConnectAnnotation, }) => {
    const relationInputClassProps = [];
    const imports = [];
    const apiExtraModels = [];
    const generatedClasses = [];
    if ((0, field_classifiers_1.isAnnotatedWith)(field, canCreateAnnotation)) {
        const preAndPostfixedName = t.createDtoName(field.type);
        apiExtraModels.push(preAndPostfixedName);
        const modelToImportFrom = allModels.find(({ name }) => name === field.type);
        if (!modelToImportFrom)
            throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);
        imports.push({
            from: (0, slash_1.default)(`${(0, exports.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${path_1.default.sep}${t.createDtoFilename(field.type)}`),
            destruct: [preAndPostfixedName],
        });
        relationInputClassProps.push({
            name: 'create',
            type: preAndPostfixedName,
        });
    }
    if ((0, field_classifiers_1.isAnnotatedWith)(field, canConnectAnnotation)) {
        const preAndPostfixedName = t.connectDtoName(field.type);
        apiExtraModels.push(preAndPostfixedName);
        const modelToImportFrom = allModels.find(({ name }) => name === field.type);
        if (!modelToImportFrom)
            throw new Error(`related model '${field.type}' for '${model.name}.${field.name}' not found`);
        imports.push({
            from: (0, slash_1.default)(`${(0, exports.getRelativePath)(model.output.dto, modelToImportFrom.output.dto)}${path_1.default.sep}${t.connectDtoFilename(field.type)}`),
            destruct: [preAndPostfixedName],
        });
        relationInputClassProps.push({
            name: 'connect',
            type: preAndPostfixedName,
        });
    }
    if (!relationInputClassProps.length) {
        throw new Error(`Can not find relation input props for '${model.name}.${field.name}'`);
    }
    const originalInputClassName = `${t.transformClassNameCase(model.name)}${t.transformClassNameCase(field.name)}RelationInput`;
    const preAndPostfixedInputClassName = preAndSuffixClassName(originalInputClassName);
    generatedClasses.push(`class ${preAndPostfixedInputClassName} {
    ${t.fieldsToDtoProps(relationInputClassProps.map((inputField) => ({
        ...inputField,
        kind: 'relation-input',
        isRequired: relationInputClassProps.length === 1,
        isList: field.isList,
    })), true)}
  }`);
    apiExtraModels.push(preAndPostfixedInputClassName);
    return {
        type: preAndPostfixedInputClassName,
        imports,
        generatedClasses,
        apiExtraModels,
    };
};
exports.generateRelationInput = generateRelationInput;
const mergeImportStatements = (first, second) => {
    if (first.from !== second.from) {
        throw new Error(`Can not merge import statements; 'from' parameter is different`);
    }
    if (first.default && second.default) {
        throw new Error(`Can not merge import statements; both statements have set the 'default' preoperty`);
    }
    const firstDestruct = first.destruct || [];
    const secondDestruct = second.destruct || [];
    const destructStrings = (0, exports.uniq)([...firstDestruct, ...secondDestruct].filter((destructItem) => typeof destructItem === 'string'));
    const destructObject = [...firstDestruct, ...secondDestruct].reduce((result, destructItem) => {
        if (typeof destructItem === 'string')
            return result;
        return { ...result, ...destructItem };
    }, {});
    return {
        ...first,
        ...second,
        destruct: [...destructStrings, destructObject],
    };
};
exports.mergeImportStatements = mergeImportStatements;
const zipImportStatementParams = (items) => {
    const itemsByFrom = items.reduce((result, item) => {
        const { from } = item;
        const { [from]: existingItem } = result;
        if (!existingItem) {
            return { ...result, [from]: item };
        }
        return { ...result, [from]: (0, exports.mergeImportStatements)(existingItem, item) };
    }, {});
    return Object.values(itemsByFrom);
};
exports.zipImportStatementParams = zipImportStatementParams;
