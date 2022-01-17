import { ImportStatementParams, ParsedField } from './types';

const PrismaScalarToTypeScript: Record<string, string> = {
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  // [Working with BigInt](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bigint)
  BigInt: 'bigint',
  Float: 'number',
  // [Working with Decimal](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-decimal)
  Decimal: 'Prisma.Decimal',
  DateTime: 'Date',
  // [working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
  Json: 'Prisma.JsonValue',
  // [Working with Bytes](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields#working-with-bytes)
  Bytes: 'Buffer',
};

const knownPrismaScalarTypes = Object.keys(PrismaScalarToTypeScript);

export const scalarToTS = (scalar: string, useInputTypes = false): string => {
  if (!knownPrismaScalarTypes.includes(scalar)) {
    throw new Error(`Unrecognized scalar type: ${scalar}`);
  }

  // [Working with JSON fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
  // supports different types for input / output. `Prisma.InputJsonValue` extends `Prisma.JsonValue` with `undefined`
  if (useInputTypes && scalar === 'Json') {
    return 'Prisma.InputJsonValue';
  }

  return PrismaScalarToTypeScript[scalar];
};

export const echo = (input: string) => input;

export const when = (condition: any, thenTemplate: string, elseTemplate = '') =>
  condition ? thenTemplate : elseTemplate;

export const unless = (
  condition: any,
  thenTemplate: string,
  elseTemplate = '',
) => (!condition ? thenTemplate : elseTemplate);

export const each = <T = any>(
  arr: Array<T>,
  fn: (item: T) => string,
  joinWith = '',
) => arr.map(fn).join(joinWith);

export const importStatement = (input: ImportStatementParams) => {
  const { from, destruct = [], default: defaultExport } = input;
  const fragments = ['import'];
  if (defaultExport) {
    if (typeof defaultExport === 'string') {
      fragments.push(defaultExport);
    } else {
      fragments.push(`* as ${defaultExport['*']}`);
    }
  }
  if (destruct.length) {
    if (defaultExport) {
      fragments.push(',');
    }
    fragments.push(
      `{${destruct.flatMap((item) => {
        if (typeof item === 'string') return item;
        return Object.entries(item).map(([key, value]) => `${key} as ${value}`);
      })}}`,
    );
  }

  fragments.push(`from '${from}'`);

  return fragments.join(' ');
};

export const importStatements = (items: ImportStatementParams[]) =>
  `${each(items, importStatement, '\n')}`;

interface MakeHelpersParam {
  connectDtoPrefix: string;
  createDtoPrefix: string;
  updateDtoPrefix: string;
  dtoSuffix: string;
  entityPrefix: string;
  entitySuffix: string;
  transformClassNameCase?: (item: string) => string;
  transformFileNameCase?: (item: string) => string;
}
export const makeHelpers = ({
  connectDtoPrefix,
  createDtoPrefix,
  updateDtoPrefix,
  dtoSuffix,
  entityPrefix,
  entitySuffix,
  transformClassNameCase = echo,
  transformFileNameCase = echo,
}: MakeHelpersParam) => {
  const className = (name: string, prefix = '', suffix = '') =>
    `${prefix}${transformClassNameCase(name)}${suffix}`;
  const fileName = (
    name: string,
    prefix = '',
    suffix = '',
    withExtension = false,
  ) =>
    `${prefix}${transformFileNameCase(name)}${suffix}${when(
      withExtension,
      '.ts',
    )}`;

  const entityName = (name: string) =>
    className(name, entityPrefix, entitySuffix);
  const connectDtoName = (name: string) =>
    className(name, connectDtoPrefix, dtoSuffix);
  const createDtoName = (name: string) =>
    className(name, createDtoPrefix, dtoSuffix);
  const updateDtoName = (name: string) =>
    className(name, updateDtoPrefix, dtoSuffix);

  const connectDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'connect-', '.dto', withExtension);

  const createDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'create-', '.dto', withExtension);

  const updateDtoFilename = (name: string, withExtension = false) =>
    fileName(name, 'update-', '.dto', withExtension);

  const entityFilename = (name: string, withExtension = false) =>
    fileName(name, undefined, '.entity', withExtension);

  const fieldType = (field: ParsedField, toInputType = false) =>
    `${
      field.kind === 'scalar'
        ? scalarToTS(field.type, toInputType)
        : field.kind === 'enum' || field.kind === 'relation-input'
        ? field.type
        : entityName(field.type)
    }${when(field.isList, '[]')}`;

  const fieldValidator = (field: ParsedField) =>
    `${
      field.type === 'String'
        ? '@IsString()'
        : field.type === 'Boolean'
        ? '@IsBoolean()'
        : field.type === 'Number'
        ? '@IsNumber()'
        : field.type === 'Int'
        ? '@IsInt()'
        : field.type === 'Bigint'
        ? '@IsNumber()'
        : field.type === 'Date'
        ? '@IsDateString()'
        : field.type === 'DateTime'
        ? '@IsDateString()'
        : ''
    }\n`;

  const fieldApiPropery = (field: ParsedField) => {
    if (field.kind === 'object') {
      return `{ type: () => ${when(field.isList, '[')}${entityName(
        field.type,
      )}${when(field.isList, ']')} }`;
    }
    return '';
  };
  const fieldOptional = (field: ParsedField, forceOptional = false) => `
        ${unless(field.isRequired && !forceOptional, '@IsOptional()')}\n`;
  const fieldToDtoProp = (
    field: ParsedField,
    useInputTypes = false,
    forceOptional = false,
  ) =>
    `${when(
      field.kind === 'enum',
      `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`,
    )}
    ${when(field.kind !== 'enum', `@ApiProperty()\n`)}${fieldValidator(
      field,
    )}${fieldOptional(field, forceOptional)}${field.name}${unless(
      field.isRequired && !forceOptional,
      '?',
    )}: ${fieldType(field, useInputTypes)};`;

  const fieldsToDtoProps = (
    fields: ParsedField[],
    useInputTypes = false,
    forceOptional = false,
  ) =>
    `${each(
      fields,
      (field) => fieldToDtoProp(field, useInputTypes, forceOptional),
      '\n',
    )}`;

  const fieldToEntityProp = (field: ParsedField) =>
    `@ApiProperty(${fieldApiPropery(field)})\n${fieldValidator(
      field,
    )}${fieldOptional(field)}${field.name}${unless(
      field.isRequired,
      '?',
    )}: ${fieldType(field)} ${when(field.isNullable, ' | null')};`;

  const fieldsToEntityProps = (fields: ParsedField[]) =>
    `${each(fields, (field) => fieldToEntityProp(field), '\n')}`;

  const apiExtraModels = (names: string[]) =>
    `@ApiExtraModels(${names.map(entityName)})`;

  const classValidatorImports = (fields: ParsedField[]) => {
    const forImport: any = [];
    for (const field of fields) {
      if (field.type === 'String' && !forImport.includes('IsString'))
        forImport.push('IsString');

      if (field.type === 'Boolean' && !forImport.includes('IsBoolean'))
        forImport.push('IsBoolean');

      if (field.type === 'Int' && !forImport.includes('IsInt'))
        forImport.push('IsInt');

      if (field.type === 'Number' && !forImport.includes('IsNumber'))
        forImport.push('IsNumber');

      if (field.type === 'Bigint' && !forImport.includes('IsNumber'))
        forImport.push('IsNumber');

      if (field.type === 'Date' && !forImport.includes('IsDateString'))
        forImport.push('IsDateString');

      if (field.type === 'DateTime' && !forImport.includes('IsDateString'))
        forImport.push('IsDateString');

      if (!field.isRequired && !forImport.includes('IsOptional'))
        forImport.push('IsOptional');
    }
    const distinct = [...new Set(forImport)];
    if (distinct.length)
      return `import { ApiProperty } from '@nestjs/swagger';\nimport { ${distinct.join(
        ', ',
      )} } from 'class-validator';`;
    else if (fields.length)
      return `import { ApiProperty } from '@nestjs/swagger';`;
    else return '';
  };
  return {
    config: {
      connectDtoPrefix,
      createDtoPrefix,
      updateDtoPrefix,
      dtoSuffix,
      entityPrefix,
      entitySuffix,
    },
    apiExtraModels,
    entityName,
    connectDtoName,
    createDtoName,
    updateDtoName,
    connectDtoFilename,
    createDtoFilename,
    updateDtoFilename,
    entityFilename,
    each,
    echo,
    fieldsToDtoProps,
    fieldToDtoProp,
    fieldToEntityProp,
    fieldsToEntityProps,
    fieldType,
    for: each,
    if: when,
    importStatement,
    importStatements,
    transformClassNameCase,
    transformFileNameCase,
    unless,
    when,
    classValidatorImports,
  };
};

export type TemplateHelpers = ReturnType<typeof makeHelpers>;
