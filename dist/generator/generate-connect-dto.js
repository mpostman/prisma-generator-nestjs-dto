"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateConnectDto = void 0;
const generateConnectDto = ({ model, fields, templateHelpers: t, }) => {
    const template = `
  ${t.classValidatorImports(fields)}
  export class ${t.connectDtoName(model.name)} {
    ${t.fieldsToDtoProps(fields, true)}
  }
  `;
    return template;
};
exports.generateConnectDto = generateConnectDto;
