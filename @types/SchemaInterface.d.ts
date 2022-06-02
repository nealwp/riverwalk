declare interface SchemaInterface {
  tableName: string,
  columns: {
    name: string,
    type: string,
  }[]
}