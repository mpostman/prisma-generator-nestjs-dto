"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DTO_RELATION_MODIFIERS_ON_UPDATE = exports.DTO_RELATION_MODIFIERS_ON_CREATE = exports.DTO_RELATION_MODIFIERS = exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE = exports.DTO_RELATION_CAN_CRAEATE_ON_UPDATE = exports.DTO_RELATION_CAN_CONNECT_ON_CREATE = exports.DTO_RELATION_CAN_CRAEATE_ON_CREATE = exports.DTO_RELATION_REQUIRED = exports.DTO_UPDATE_OPTIONAL = exports.DTO_CREATE_OPTIONAL = exports.DTO_ENTITY_HIDDEN = exports.DTO_READ_ONLY = exports.DTO_IGNORE_MODEL = void 0;
exports.DTO_IGNORE_MODEL = /@DtoIgnoreModel/;
exports.DTO_READ_ONLY = /@DtoReadOnly/;
exports.DTO_ENTITY_HIDDEN = /@DtoEntityHidden/;
exports.DTO_CREATE_OPTIONAL = /@DtoCreateOptional/;
exports.DTO_UPDATE_OPTIONAL = /@DtoUpdateOptional/;
exports.DTO_RELATION_REQUIRED = /@DtoRelationRequired/;
exports.DTO_RELATION_CAN_CRAEATE_ON_CREATE = /@DtoRelationCanCreateOnCreate/;
exports.DTO_RELATION_CAN_CONNECT_ON_CREATE = /@DtoRelationCanConnectOnCreate/;
exports.DTO_RELATION_CAN_CRAEATE_ON_UPDATE = /@DtoRelationCanCreateOnUpdate/;
exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE = /@DtoRelationCanConnectOnUpdate/;
exports.DTO_RELATION_MODIFIERS = [
    exports.DTO_RELATION_CAN_CRAEATE_ON_CREATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_CREATE,
    exports.DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
];
exports.DTO_RELATION_MODIFIERS_ON_CREATE = [
    exports.DTO_RELATION_CAN_CRAEATE_ON_CREATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_CREATE,
];
exports.DTO_RELATION_MODIFIERS_ON_UPDATE = [
    exports.DTO_RELATION_CAN_CRAEATE_ON_UPDATE,
    exports.DTO_RELATION_CAN_CONNECT_ON_UPDATE,
];
