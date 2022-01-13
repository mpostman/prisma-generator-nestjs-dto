"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntity = void 0;
const generateEntity = ({ model, fields, imports, apiExtraModels, templateHelpers: t, }) => `
${t.importStatements(imports)}

${t.if(apiExtraModels.length, t.apiExtraModels(apiExtraModels))}
${t.classValidatorImports(fields)}
export class ${t.entityName(model.name)} {
  ${t.fieldsToEntityProps(fields)}
}
`;
exports.generateEntity = generateEntity;
