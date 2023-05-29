import { existsSync, mkdirSync, writeFile } from 'fs';
import { db, typeExportPath } from './config';
import { QueryResult } from 'pg';
import { formatColumnName, formatTableName } from './formatters';

const command = process.argv[2];

const getDatabaseSchema = async (): Promise<any> => {
  const startTime = new Date().getTime();
  try {
    const result: QueryResult<any> = await db.query(
      `select table_schema || '.' || table_name as "tableName", 
      column_name as "columnName", 
      data_type as "dataType"
      from information_schema.columns
      where table_name not like 'pg_%' 
      and table_name not like 'sql_%' 
      and table_schema != 'information_schema'
      order by table_schema, table_name;`
    );
    const elapsed = new Date().getTime() - startTime;
    console.log(`getDatabaseSchema: ${elapsed} ms`)
    return result;
  } catch(err: unknown) {
    return err;
  }
};

const parseDatatype = (datatype: string): string => {
  const types: TypeMap = {
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

const processDatabaseSchema = async (dbSchema: DatabaseSchemaRecord[]): Promise<any> => {
  const startTime = new Date().getTime();
  try {
    const schemaData: SchemaInterface[] = [];
    const tables = [...new Set(dbSchema.map(row => row.tableName))];
    tables.forEach(t => {
      let filteredColumns = dbSchema.filter(e => e.tableName === t);
      let columns: {name: string, type: string}[] = [{name: '', type: ''}];
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
    console.log(`processDatabaseSchema: ${elapsed} ms`)
    return schemaData;
  } catch(error) {
    console.log(error);
    return error;
  }
};

const formatSchemaData = async (schemaData: SchemaInterface[]): Promise<any> => {
  const startTime = new Date().getTime();
  try {
    schemaData.forEach(table => {
      table.tableName = formatTableName(table.tableName);
      table.columns.forEach(column => {
        column.name = formatColumnName(column.name);
        column.type = parseDatatype(column.type);
      });
    });
    const elapsed = new Date().getTime() - startTime;
    console.log(`formatSchemaData: ${elapsed} ms`)
    return schemaData;
  } catch(error) {
    return error;
  }
};

const generateDeclarationFiles = async (formattedSchemaData: SchemaInterface[]): Promise<any> => {
  const startTime = new Date().getTime();
  const interfaceTemplate = (obj: SchemaInterface) => {
    let columns = ``;
    obj.columns.forEach(col => {
      columns = `${columns}\t${col.name}: ${col.type},\n`;
    });
    return `declare interface ${obj.tableName} {\n${columns}}\n`;
  }; 

  try {
    if (!existsSync(typeExportPath)){
      mkdirSync(typeExportPath);
    }
    for await (let table of formattedSchemaData) {
      writeFile(`${typeExportPath}/${table.tableName}.d.ts`, interfaceTemplate(table), err => {
        if (err) {
          console.log(err);
          return;
        }
      });
    };
    const elapsed = new Date().getTime() - startTime;
    console.log(`generateDeclarationFiles: ${elapsed} ms`)
    return;
  } catch(error) {
    console.log(error);
  }
};

async function main(): Promise<any> {
  try {
    const startTime = new Date().getTime();
    const dbSchema = await getDatabaseSchema()
    const schemaData = await processDatabaseSchema(dbSchema.rows);
    const formattedSchemaData = await formatSchemaData(schemaData);
    await generateDeclarationFiles(formattedSchemaData)
    const elapsed = new Date().getTime() - startTime;
    console.log(`complete in ${elapsed} ms`);
    return;
  } catch(error) {
    console.log('error in main catch block')
    console.error(error);
  }
}

if (command === 'run') {
  main();
} else {
  console.log(`command ${command} not recognized.`);
}