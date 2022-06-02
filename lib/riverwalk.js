"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const config_1 = require("./config");
const formatters_1 = require("./formatters");
const command = process.argv[2];
const getDatabaseSchema = () => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = new Date().getTime();
    try {
        const result = yield config_1.db.query(`select table_schema || '.' || table_name as "tableName", 
      column_name as "columnName", 
      data_type as "dataType"
      from information_schema.columns
      where table_name not like 'pg_%' 
      and table_name not like 'sql_%' 
      and table_schema != 'information_schema'
      order by table_schema, table_name;`);
        const elapsed = new Date().getTime() - startTime;
        console.log(`getDatabaseSchema: ${elapsed} ms`);
        return result;
    }
    catch (err) {
        return err;
    }
});
const parseDatatype = (datatype) => {
    const types = {
        'bigint': 'number',
        'bigserial': 'number',
        'bit': 'string',
        'bit varying': 'string',
        'boolean': 'boolean',
        'character': 'string',
        'character varying': 'string',
        'date': 'Date',
        'double precision': 'number',
        'integer': 'number',
        'json': 'string',
        'money': 'number',
        'numeric': 'number',
        'real': 'number',
        'smallint': 'number',
        'smallserial': 'number',
        'serial': 'number',
        'text': 'string',
        'timestamp': 'Date',
        'timestamp without time zone': 'Date',
        'timestamp with time zone': 'Date',
        'uuid': 'string',
        'default': 'any'
    };
    return types[datatype] || types['default'];
};
const processDatabaseSchema = (dbSchema) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = new Date().getTime();
    try {
        const schemaData = [];
        const tables = [...new Set(dbSchema.map(row => row.tableName))];
        tables.forEach(t => {
            let filteredColumns = dbSchema.filter(e => e.tableName === t);
            let columns = [{ name: '', type: '' }];
            filteredColumns.forEach(item => {
                columns.push({
                    name: item.columnName,
                    type: item.dataType
                });
            });
            columns.shift();
            schemaData.push({
                tableName: t,
                columns
            });
        });
        const elapsed = new Date().getTime() - startTime;
        console.log(`processDatabaseSchema: ${elapsed} ms`);
        return schemaData;
    }
    catch (error) {
        console.log(error);
        return error;
    }
});
const formatSchemaData = (schemaData) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = new Date().getTime();
    try {
        schemaData.forEach(table => {
            table.tableName = (0, formatters_1.formatTableName)(table.tableName);
            table.columns.forEach(column => {
                column.name = (0, formatters_1.formatColumnName)(column.name);
                column.type = parseDatatype(column.type);
            });
        });
        const elapsed = new Date().getTime() - startTime;
        console.log(`formatSchemaData: ${elapsed} ms`);
        return schemaData;
    }
    catch (error) {
        return error;
    }
});
const generateDeclarationFiles = (formattedSchemaData) => { var formattedSchemaData_1, formattedSchemaData_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    const startTime = new Date().getTime();
    const interfaceTemplate = (obj) => {
        let columns = ``;
        obj.columns.forEach(col => {
            columns = `${columns}\t${col.name}: ${col.type},\n`;
        });
        return `declare interface ${obj.tableName} {\n${columns}}\n`;
    };
    try {
        if (!(0, fs_1.existsSync)(config_1.typeExportPath)) {
            (0, fs_1.mkdirSync)(config_1.typeExportPath);
        }
        try {
            for (formattedSchemaData_1 = __asyncValues(formattedSchemaData); formattedSchemaData_1_1 = yield formattedSchemaData_1.next(), !formattedSchemaData_1_1.done;) {
                let table = formattedSchemaData_1_1.value;
                (0, fs_1.writeFile)(`${config_1.typeExportPath}/${table.tableName}.d.ts`, interfaceTemplate(table), err => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (formattedSchemaData_1_1 && !formattedSchemaData_1_1.done && (_a = formattedSchemaData_1.return)) yield _a.call(formattedSchemaData_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        ;
        const elapsed = new Date().getTime() - startTime;
        console.log(`generateDeclarationFiles: ${elapsed} ms`);
        return;
    }
    catch (error) {
        console.log(error);
    }
}); };
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const startTime = new Date().getTime();
            const dbSchema = yield getDatabaseSchema();
            const schemaData = yield processDatabaseSchema(dbSchema.rows);
            const formattedSchemaData = yield formatSchemaData(schemaData);
            yield generateDeclarationFiles(formattedSchemaData);
            const elapsed = new Date().getTime() - startTime;
            console.log(`complete in ${elapsed} ms`);
            return;
        }
        catch (error) {
            console.log('error in main catch block');
            console.error(error);
        }
    });
}
if (command === 'run') {
    main();
}
else {
    console.log(`command ${command} not recognized.`);
}
