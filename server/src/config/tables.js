export const TABLES = {
  USERS: 'Users',
  BOARDS: 'Boards',
  LISTS: 'Lists',
  TASKS: 'Tasks',
  IMAGES: 'Images',
  UNIQUE_IDS: 'UniqueIds',
}

export const TABLE_SCHEMAS = {
  [TABLES.USERS]: {
    KeySchema: [
      { AttributeName: 'uid', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'uid', AttributeType: 'S' }],
  },
  [TABLES.BOARDS]: {
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
  },
  [TABLES.LISTS]: {
    KeySchema: [
      { AttributeName: 'boardId', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'id', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'boardId', AttributeType: 'S' },
      { AttributeName: 'id', AttributeType: 'S' },
    ],
  },
  [TABLES.TASKS]: {
    KeySchema: [
      { AttributeName: 'listId', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'id', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'listId', AttributeType: 'S' },
      { AttributeName: 'id', AttributeType: 'S' },
    ],
  },
  [TABLES.IMAGES]: {
    KeySchema: [
      { AttributeName: 'type', KeyType: 'HASH' }, // Partition key
      { AttributeName: 'id', KeyType: 'RANGE' }, // Sort key
    ],
    AttributeDefinitions: [
      { AttributeName: 'type', AttributeType: 'S' },
      { AttributeName: 'id', AttributeType: 'S' },
    ],
  },
  [TABLES.UNIQUE_IDS]: {
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
  },
}
