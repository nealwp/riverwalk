import config from '../rwconfig.json';
import { Pool } from 'pg';
import { RDS } from 'aws-sdk';

const signer = new RDS.Signer();

const getPassword = () => signer.getAuthToken({
  credentials: { 
    accessKeyId: config.aws.accessKeyId, 
    secretAccessKey: config.aws.secretAccessKey
  },
  region: config.aws.region,
  hostname: config.database.hostname,
  port: config.database.port,
  username: config.database.username,
});

export const db = new Pool({
  host: config.database.hostname,
  port: config.database.port,
  user: config.database.username,
  database: config.database.name,
  password: config.database.password,
});

export const typeExportPath = config.typeDirectory;