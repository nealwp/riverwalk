"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeExportPath = exports.db = void 0;
const rwconfig_json_1 = __importDefault(require("../rwconfig.json"));
const pg_1 = require("pg");
const aws_sdk_1 = require("aws-sdk");
const signer = new aws_sdk_1.RDS.Signer();
const getPassword = () => signer.getAuthToken({
    credentials: {
        accessKeyId: rwconfig_json_1.default.aws.accessKeyId,
        secretAccessKey: rwconfig_json_1.default.aws.secretAccessKey
    },
    region: rwconfig_json_1.default.aws.region,
    hostname: rwconfig_json_1.default.database.hostname,
    port: rwconfig_json_1.default.database.port,
    username: rwconfig_json_1.default.database.username,
});
exports.db = new pg_1.Pool({
    host: rwconfig_json_1.default.database.hostname,
    port: rwconfig_json_1.default.database.port,
    user: rwconfig_json_1.default.database.username,
    database: rwconfig_json_1.default.database.name,
    password: rwconfig_json_1.default.database.password,
});
exports.typeExportPath = rwconfig_json_1.default.typeDirectory;
