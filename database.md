# Database Documentation

## Current Database: Firebase Realtime Database

### Structure

```
/users
  /{userId}
    - email
    - name
    - picture
    /boards
      /{boardId}
        - boardId

/boards
  /{boardId}
    - title
    - admin
    - coverPhoto
    - visibility
    - users
      /{userId}
        - role
    /lists
      /{listId}
        - title
        - taskIds
    /tasks
      /{taskId}
        - title
        - description
        - assignee
        - dueDate
        - labels
```

### DynamoDB Single Table Design

```javascript
const tableParams = {
  TableName: "ProjectManagementTable",
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" },
    { AttributeName: "sk", KeyType: "RANGE" },
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" },
    { AttributeName: "sk", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" },
    { AttributeName: "assignee", AttributeType: "S" },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "UserBoardIndex",
      KeySchema: [
        { AttributeName: "sk", KeyType: "HASH" },
        { AttributeName: "pk", KeyType: "RANGE" },
      ],
      Projection: { ProjectionType: "ALL" },
    },
    {
      IndexName: "EmailIndex",
      KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
    {
      IndexName: "AssigneeIndex",
      KeySchema: [{ AttributeName: "assignee", KeyType: "HASH" }],
      Projection: { ProjectionType: "ALL" },
    },
  ],
};
```

### Access Patterns

| Access Pattern             | Index          | Key Condition                                  |
| -------------------------- | -------------- | ---------------------------------------------- |
| Get user by ID             | Primary        | pk = "USER#userId", sk = "METADATA"            |
| Get user by email          | EmailIndex     | email = "user@example.com"                     |
| Get boards for user        | UserBoardIndex | sk = "USER#userId", begins_with(pk, "BOARD#")  |
| Get board details          | Primary        | pk = "BOARD#boardId", sk = "METADATA"          |
| Get users for board        | UserBoardIndex | sk = "BOARD#boardId", begins_with(pk, "USER#") |
| Get lists for board        | Primary        | pk = "BOARD#boardId", begins_with(sk, "LIST#") |
| Get tasks for board        | Primary        | pk = "BOARD#boardId", begins_with(sk, "TASK#") |
| Get tasks for list         | Primary        | pk = "LIST#listId"                             |
| Get tasks assigned to user | AssigneeIndex  | assignee = "userId"                            |
