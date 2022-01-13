"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRequiredWithDefaultValue = exports.isUpdatedAt = exports.isReadOnly = exports.isIdWithDefaultValue = exports.isRelation = exports.isUnique = exports.hasDefaultValue = exports.isScalar = exports.isRequired = exports.isId = exports.isAnnotatedWithOneOf = exports.isAnnotatedWith = void 0;
const annotations_1 = require("./annotations");
const isAnnotatedWith = (instance, annotation) => {
    const { documentation = '' } = instance;
    return annotation.test(documentation);
};
exports.isAnnotatedWith = isAnnotatedWith;
const isAnnotatedWithOneOf = (instance, annotations) => annotations.some((annotation) => (0, exports.isAnnotatedWith)(instance, annotation));
exports.isAnnotatedWithOneOf = isAnnotatedWithOneOf;
const isId = (field) => {
    return field.isId;
};
exports.isId = isId;
const isRequired = (field) => {
    return field.isRequired;
};
exports.isRequired = isRequired;
const isScalar = (field) => {
    return field.kind === 'scalar';
};
exports.isScalar = isScalar;
const hasDefaultValue = (field) => {
    return field.hasDefaultValue;
};
exports.hasDefaultValue = hasDefaultValue;
const isUnique = (field) => {
    return field.isUnique;
};
exports.isUnique = isUnique;
const isRelation = (field) => {
    const { kind } = field;
    return kind === 'object';
};
exports.isRelation = isRelation;
const isIdWithDefaultValue = (field) => (0, exports.isId)(field) && (0, exports.hasDefaultValue)(field);
exports.isIdWithDefaultValue = isIdWithDefaultValue;
const isReadOnly = (field) => field.isReadOnly || (0, exports.isAnnotatedWith)(field, annotations_1.DTO_READ_ONLY);
exports.isReadOnly = isReadOnly;
const isUpdatedAt = (field) => {
    return field.isUpdatedAt;
};
exports.isUpdatedAt = isUpdatedAt;
const isRequiredWithDefaultValue = (field) => (0, exports.isRequired)(field) && (0, exports.hasDefaultValue)(field);
exports.isRequiredWithDefaultValue = isRequiredWithDefaultValue;
