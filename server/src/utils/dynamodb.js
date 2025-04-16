import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import dynamoDB from '../config/dynamodb.js'
import { TABLE_NAME } from '../config/tables.js'

// Create a new item in the single table
export const createItem = async (item) => {
  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    )
    return item
  } catch (error) {
    console.error(`Error creating item:`, error)
    throw error
  }
}

// Get an item by its primary key (PK and SK)
export const getItem = async (key) => {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: key,
      })
    )
    return result.Item
  } catch (error) {
    console.error(`Error getting item:`, error)
    throw error
  }
}

// Query items using key condition expression
export const queryItems = async ({
  keyConditionExpression,
  expressionAttributeValues,
  expressionAttributeNames = null,
  filterExpression = null,
  indexName = null,
}) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression
    }

    if (indexName) {
      params.IndexName = indexName
    }

    const result = await dynamoDB.send(new QueryCommand(params))
    return result.Items
  } catch (error) {
    console.error(`Error querying items:`, error)
    throw error
  }
}

// Update an item by its primary key
export const updateItem = async ({
  key,
  updateExpression,
  expressionAttributeValues,
  expressionAttributeNames = {},
}) => {
  try {
    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      })
    )
    return result.Attributes
  } catch (error) {
    console.error(`Error updating item:`, error)
    throw error
  }
}

// Delete an item by its primary key
export const deleteItem = async (key) => {
  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error(`Error deleting item:`, error)
    throw error
  }
}

// Batch write items
export const batchWrite = async (items) => {
  try {
    const requests = items.map((item) => ({
      PutRequest: {
        Item: item,
      },
    }))

    await dynamoDB.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: requests,
        },
      })
    )
    return true
  } catch (error) {
    console.error(`Error batch writing:`, error)
    throw error
  }
}

// Batch delete items
export const batchDelete = async (keys) => {
  try {
    const requests = keys.map((key) => ({
      DeleteRequest: {
        Key: key,
      },
    }))

    await dynamoDB.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: requests,
        },
      })
    )
    return true
  } catch (error) {
    console.error(`Error batch deleting:`, error)
    throw error
  }
}

// Query items by GSI
export const queryByIndex = async ({
  indexName,
  keyConditionExpression,
  expressionAttributeValues,
  expressionAttributeNames = null,
  filterExpression = null,
}) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  queryItems({
    indexName,
    keyConditionExpression,
    expressionAttributeValues,
    expressionAttributeNames,
    filterExpression,
  })

// Scan the table with optional filter
export const scanItems = async ({
  filterExpression = null,
  expressionAttributeValues = null,
  expressionAttributeNames = null,
  indexName = null,
}) => {
  try {
    const params = {
      TableName: TABLE_NAME,
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression
    }

    if (expressionAttributeValues) {
      params.ExpressionAttributeValues = expressionAttributeValues
    }

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames
    }

    if (indexName) {
      params.IndexName = indexName
    }

    const result = await dynamoDB.send(new ScanCommand(params))
    return result.Items
  } catch (error) {
    console.error(`Error scanning items:`, error)
    throw error
  }
}
