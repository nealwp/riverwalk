"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatColumnName = exports.formatTableName = void 0;
const toProperCase = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toPascalCase = (str) => {
    let x = str.split('_');
    for (let i = 0; i < x.length; i++) {
        x[i] = toProperCase(x[i]);
    }
    return x.join('');
};
const toCamelCase = (str) => {
    let x = str.split('_');
    if (x.length > 1) {
        for (let i = 1; i < x.length; i++) {
            x[i] = toProperCase(x[i]);
        }
        return x.join('');
    }
    return str;
};
const formatTableName = (str) => {
    if (!str.includes('.')) {
        return toPascalCase(str);
    }
    let arr = str.split('.');
    arr.forEach((el, i, arr) => arr[i] = toPascalCase(arr[i]));
    return arr.join('');
};
exports.formatTableName = formatTableName;
const formatColumnName = (str) => {
    return toCamelCase(str);
};
exports.formatColumnName = formatColumnName;
