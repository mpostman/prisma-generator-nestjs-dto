"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeConnectDtoParams = void 0;
const field_classifiers_1 = require("../field-classifiers");
const helpers_1 = require("../helpers");
const computeConnectDtoParams = ({ model, }) => {
    const idFields = model.fields.filter((field) => (0, field_classifiers_1.isId)(field));
    const isUniqueFields = model.fields.filter((field) => (0, field_classifiers_1.isUnique)(field));
    const uniqueFields = (0, helpers_1.uniq)([...idFields, ...isUniqueFields]);
    const overrides = uniqueFields.length > 1 ? { isRequired: false } : {};
    const fields = uniqueFields.map((field) => (0, helpers_1.mapDMMFToParsedField)(field, overrides));
    return { model, fields };
};
exports.computeConnectDtoParams = computeConnectDtoParams;
