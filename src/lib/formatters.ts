const toProperCase = (str: string): string => {
  return str.charAt(0).toUpperCase()+str.slice(1);
};

const toPascalCase = (str: string): string => {
  let x = str.split('_');
  for (let i = 0; i < x.length; i++) {
    x[i] = toProperCase(x[i]);
  }
  return x.join('');
}

const toCamelCase = (str: string): string => {
  let x = str.split('_');
  if (x.length > 1) {
    for (let i = 1; i < x.length; i++) {
      x[i] = toProperCase(x[i]);
    }
    return x.join('');
  }
  return str;
}

export const formatTableName = (str: string) => {
  if (!str.includes('.')) {
    return toPascalCase(str);
  }
  let arr = str.split('.');
  arr.forEach((el, i, arr) => arr[i] = toPascalCase(arr[i]));
  return arr.join('');
}

export const formatColumnName = (str: string) =>{
  return toCamelCase(str);
}