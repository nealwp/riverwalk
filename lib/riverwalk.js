require('dotenv').config();
const fs = require('fs');
const pg = require('pg');
const AWS = require('aws-sdk');

const { Pool } = pg;
const { RDS } = AWS;

const signer = new RDS.Signer();

const getPassword = () => signer.getAuthToken({
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_KEY,
  },
  region: process.env.AWS_REGION,
  hostname: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USER,
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PWD,
});

const command = process.argv[2];

const getDatabaseSchema = async () => {
    try {
      const result = await pool.query(
        `select table_schema || '.' || table_name as table_name, column_name, data_type 
        from information_schema.columns
        where table_name not like 'pg_%' 
        and table_name not like 'sql_%' 
        and table_schema != 'information_schema'
        order by table_schema, table_name;`
      );
      return result;
    } catch(err) {
      return err;
    }
};

const toProperCase = (str) => {
  return str.charAt(0).toUpperCase()+str.slice(1);
};

const fixUnderscores = (str) => {
  let x = str.split('_');
  for (let i = 0; i < x.length; i++) {
    x[i] = toProperCase(x[i]);
  }
  return x.join('');
};

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

const format = (str) => {
   if (str.includes('.')) {
    arr = str.split('.');
    arr.forEach((el, i, arr) => arr[i] = toProperCase(arr[i]));
    str = arr.join('');
  }
  str = toProperCase(str);
  str = fixUnderscores(str);
  return str;
};

const processDatabaseSchema = async (dbSchema) => {
  try {
    const schemaData = [];
    const tables = [...new Set(dbSchema.map(row => row.table_name))];
  
    tables.forEach(t => {
      schemaData.push({
        tableName: t,
        columns: [
          // {
          //   name: '',
          //   type: ''
          // }
        ]
      });
    });

    schemaData.forEach(table => {
      let filteredColumns = dbSchema.filter(e => e.table_name === table.tableName);
      filteredColumns.forEach(item => {
        table.columns.push({name: item.column_name, type: item.data_type});
      });
    });
    return schemaData;
  } catch(error) {
    console.log(error);
  }
};

const formatSchemaData = async (schemaData) => {
  try {
    schemaData.forEach(table => {
      table.tableName = format(table.tableName);
      table.columns.forEach(column => {
        column.name = format(column.name);
        column.type = parseDatatype(column.type);
      });
    });
    return schemaData;
  } catch(error) {
    return error;
  }
};

const generateDeclarationFiles = async (schemaData) => {
  const interfaceTemplate = (obj) => {
    let columns = ``;
    obj.columns.forEach(col => {
      columns = columns + `\t${col.name}: ${col.type},\n`;
    });
    return `declare interface ${obj.tableName} {\n${columns}}\n`;
  }; 

  try {
    if (!fs.existsSync('./@types')){
      fs.mkdirSync('./@types');
    }
    schemaData.forEach(table => {
      fs.writeFile('./@types/' + table.tableName + '.d.ts', interfaceTemplate(table), err => {
        if (err) {
          console.log(err);
          return;
        }
      });
    });
    return;
  } catch(error) {
    console.log(error);
  }
};

async function main() {
  try {
    const start = new Date();
    const dbSchema = await getDatabaseSchema();
    const schemaData = await processDatabaseSchema(dbSchema.rows);
    const formattedSchemaData = await formatSchemaData(schemaData);
    await generateDeclarationFiles(formattedSchemaData);
    const elapsed = new Date() - start;
    console.log(`done in ${elapsed} ms`);
  } catch(error) {
    console.error(error);
  }
  
}

if (command === 'run') {
  main();
} else {
  console.log(`command ${command} not recognized.`);
}
