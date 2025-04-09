// Single table design for DynamoDB
export const { TABLE_NAME } = process.env;

// Entity types
export const ENTITY_TYPES = {
  USER: 'USER',
  BOARD: 'BOARD',
  LIST: 'LIST',
  TASK: 'TASK',
  IMAGE: 'IMAGE',
};

// Table schema definition
export const TABLE_SCHEMA = {
  TableName: TABLE_NAME,
  KeySchema: [
    { AttributeName: 'pk', KeyType: 'HASH' }, // Partition key
    { AttributeName: 'sk', KeyType: 'RANGE' }, // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'pk', AttributeType: 'S' },
    { AttributeName: 'sk', AttributeType: 'S' },
    { AttributeName: 'email', AttributeType: 'S' },
    { AttributeName: 'assignee', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'UserBoardIndex',
      KeySchema: [
        { AttributeName: 'sk', KeyType: 'HASH' },
        { AttributeName: 'pk', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'EmailIndex',
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
    {
      IndexName: 'AssigneeIndex',
      KeySchema: [
        { AttributeName: 'assignee', KeyType: 'HASH' },
      ],
      Projection: { ProjectionType: 'ALL' },
    },
  ],
};

// Helper functions to generate keys
export const keys = {
  user: (userId) => ({
    pk: `USER#${userId}`,
    sk: 'METADATA',
  }),
  userBoards: (userId) => ({
    sk: `USER#${userId}`,
    // Use with begins_with(pk, 'BOARD#') in UserBoardIndex
  }),
  board: (boardId) => ({
    pk: `BOARD#${boardId}`,
    sk: 'METADATA',
  }),
  boardUsers: (boardId) => ({
    sk: `BOARD#${boardId}`,
    // Use with begins_with(pk, 'USER#') in UserBoardIndex
  }),
  boardLists: (boardId) => ({
    pk: `BOARD#${boardId}`,
    // Use with begins_with(sk, 'LIST#')
  }),
  boardTasks: (boardId) => ({
    pk: `BOARD#${boardId}`,
    // Use with begins_with(sk, 'TASK#')
  }),
  list: (boardId, listId) => ({
    pk: `BOARD#${boardId}`,
    sk: `LIST#${listId}`,
  }),
  task: (boardId, taskId) => ({
    pk: `BOARD#${boardId}`,
    sk: `TASK#${taskId}`,
  }),
  tasksByAssignee: (userId) => ({
    assignee: userId,
    // Use with AssigneeIndex
  }),
  userByEmail: (email) => ({
    email,
    // Use with EmailIndex
  }),
};
