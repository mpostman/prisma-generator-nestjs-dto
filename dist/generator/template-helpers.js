"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHelpers = exports.importStatements = exports.importStatement = exports.each = exports.unless = exports.when = exports.echo = exports.scalarToTS = void 0;
const PrismaScalarToTypeScript = {
    String: 'string',
    Boolean: 'boolean',
    Int: 'number',
    BigInt: 'bigint',
    Float: 'number',
    Decimal: 'Prisma.Decimal',
    DateTime: 'Date',
    Json: 'Prisma.JsonValue',
    Bytes: 'Buffer',
};
const knownPrismaScalarTypes = Object.keys(PrismaScalarToTypeScript);
const scalarToTS = (scalar, useInputTypes = false) => {
    if (!knownPrismaScalarTypes.includes(scalar)) {
        throw new Error(`Unrecognized scalar type: ${scalar}`);
    }
    if (useInputTypes && scalar === 'Json') {
        return 'Prisma.InputJsonValue';
    }
    return PrismaScalarToTypeScript[scalar];
};
exports.scalarToTS = scalarToTS;
const echo = (input) => input;
exports.echo = echo;
const when = (condition, thenTemplate, elseTemplate = '') => condition ? thenTemplate : elseTemplate;
exports.when = when;
const unless = (condition, thenTemplate, elseTemplate = '') => (!condition ? thenTemplate : elseTemplate);
exports.unless = unless;
const each = (arr, fn, joinWith = '') => arr.map(fn).join(joinWith);
exports.each = each;
const importStatement = (input) => {
    const { from, destruct = [], default: defaultExport } = input;
    const fragments = ['import'];
    if (defaultExport) {
        if (typeof defaultExport === 'string') {
            fragments.push(defaultExport);
        }
        else {
            fragments.push(`* as ${defaultExport['*']}`);
        }
    }
    if (destruct.length) {
        if (defaultExport) {
            fragments.push(',');
        }
        fragments.push(`{${destruct.flatMap((item) => {
            if (typeof item === 'string')
                return item;
            return Object.entries(item).map(([key, value]) => `${key} as ${value}`);
        })}}`);
    }
    fragments.push(`from '${from}'`);
    return fragments.join(' ');
};
exports.importStatement = importStatement;
const importStatements = (items) => `${(0, exports.each)(items, exports.importStatement, '\n')}`;
exports.importStatements = importStatements;
const makeHelpers = ({ connectDtoPrefix, createDtoPrefix, updateDtoPrefix, dtoSuffix, entityPrefix, entitySuffix, transformClassNameCase = exports.echo, transformFileNameCase = exports.echo, }) => {
    const className = (name, prefix = '', suffix = '') => `${prefix}${transformClassNameCase(name)}${suffix}`;
    const fileName = (name, prefix = '', suffix = '', withExtension = false) => `${prefix}${transformFileNameCase(name)}${suffix}${(0, exports.when)(withExtension, '.ts')}`;
    const entityName = (name) => className(name, entityPrefix, entitySuffix);
    const connectDtoName = (name) => className(name, connectDtoPrefix, dtoSuffix);
    const createDtoName = (name) => className(name, createDtoPrefix, dtoSuffix);
    const updateDtoName = (name) => className(name, updateDtoPrefix, dtoSuffix);
    const connectDtoFilename = (name, withExtension = false) => fileName(name, 'connect-', '.dto', withExtension);
    const createDtoFilename = (name, withExtension = false) => fileName(name, 'create-', '.dto', withExtension);
    const updateDtoFilename = (name, withExtension = false) => fileName(name, 'update-', '.dto', withExtension);
    const entityFilename = (name, withExtension = false) => fileName(name, undefined, '.entity', withExtension);
    const fieldType = (field, toInputType = false) => `${field.kind === 'scalar'
        ? (0, exports.scalarToTS)(field.type, toInputType)
        : field.kind === 'enum' || field.kind === 'relation-input'
            ? field.type
            : entityName(field.type)}${(0, exports.when)(field.isList, '[]')}`;
    const fieldValidator = (field) => `${field.type === 'String'
        ? '@IsString()'
        : field.type === 'Boolean' ? '@IsBoolean()'
            : field.type === 'Number' ? '@IsNumber()'
                : field.type === 'Int' ? '@IsInt()'
                    : field.type === 'Bigint' ? '@IsNumber()'
                        : field.type === 'Date' ? '@IsDateString()'
                            : ''}\n`;
    const fieldApiPropery = (field) => {
        if (field.kind === 'object') {
            return `{ type: () => ${(0, exports.when)(field.isList, '[')}${entityName(field.type)}$${(0, exports.when)(field.isList, ']')} }`;
        }
        return '';
    };
    const fieldOptional = (field, forceOptional = false) => `
        ${(0, exports.unless)(field.isRequired && !forceOptional, '@IsOptional()')}\n`;
    const fieldToDtoProp = (field, useInputTypes = false, forceOptional = false) => `${(0, exports.when)(field.kind === 'enum', `@ApiProperty({ enum: ${fieldType(field, useInputTypes)}})\n`)}
    ${(0, exports.when)(field.kind !== 'enum', `@ApiProperty()\n`)}${fieldValidator(field)}${fieldOptional(field, forceOptional)}${field.name}${(0, exports.unless)(field.isRequired && !forceOptional, '?')}: ${fieldType(field, useInputTypes)};`;
    const fieldsToDtoProps = (fields, useInputTypes = false, forceOptional = false) => `${(0, exports.each)(fields, (field) => fieldToDtoProp(field, useInputTypes, forceOptional), '\n')}`;
    const fieldToEntityProp = (field) => `@ApiProperty(${fieldApiPropery(field)})\n${fieldValidator(field)}${fieldOptional(field)}${field.name}${(0, exports.unless)(field.isRequired, '?')}: ${fieldType(field)} ${(0, exports.when)(field.isNullable, ' | null')};`;
    const fieldsToEntityProps = (fields) => `${(0, exports.each)(fields, (field) => fieldToEntityProp(field), '\n')}`;
    const apiExtraModels = (names) => `@ApiExtraModels(${names.map(entityName)})`;
    const classValidatorImports = (fields) => {
        const forImport = [];
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
            if (!field.isRequired && !forImport.includes('IsOptional'))
                forImport.push('IsOptional');
        }
        const distinct = [...new Set(forImport)];
        if (distinct.length)
            return `import { ApiProperty } from '@nestjs/swagger';\nimport { ${distinct.join(', ')} } from 'class-validator';`;
        else if (fields.length)
            return `import { ApiProperty } from '@nestjs/swagger';`;
        else
            return '';
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
        each: exports.each,
        echo: exports.echo,
        fieldsToDtoProps,
        fieldToDtoProp,
        fieldToEntityProp,
        fieldsToEntityProps,
        fieldType,
        for: exports.each,
        if: exports.when,
        importStatement: exports.importStatement,
        importStatements: exports.importStatements,
        transformClassNameCase,
        transformFileNameCase,
        unless: exports.unless,
        when: exports.when,
        classValidatorImports,
    };
};
exports.makeHelpers = makeHelpers;
