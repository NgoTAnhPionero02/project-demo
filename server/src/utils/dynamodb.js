import dynamoDB from '../config/dynamodb.js'
import { TABLES } from '../config/tables.js'
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'

export const createItem = async (table, item) => {
  try {
    await dynamoDB.send(
      new PutCommand({
        TableName: table,
        Item: item,
      })
    )
    return item
  } catch (error) {
    console.error(`Error creating item in ${table}:`, error)
    throw error
  }
}

export const getItem = async (table, key) => {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: table,
        Key: key,
      })
    )
    return result.Item
  } catch (error) {
    console.error(`Error getting item from ${table}:`, error)
    throw error
  }
}

export const queryItems = async (
  table,
  keyCondition,
  filterExpression = null,
  expressionValues = {}
) => {
  try {
    const params = {
      TableName: table,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
    }

    if (filterExpression) {
      params.FilterExpression = filterExpression
    }

    const result = await dynamoDB.send(new QueryCommand(params))
    return result.Items
  } catch (error) {
    console.error(`Error querying items from ${table}:`, error)
    throw error
  }
}

export const updateItem = async (
  table,
  key,
  updateExpression,
  expressionValues,
  expressionNames = {}
) => {
  try {
    const result = await dynamoDB.send(
      new UpdateCommand({
        TableName: table,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionValues,
        ExpressionAttributeNames: expressionNames,
        ReturnValues: 'ALL_NEW',
      })
    )
    return result.Attributes
  } catch (error) {
    console.error(`Error updating item in ${table}:`, error)
    throw error
  }
}

export const deleteItem = async (table, key) => {
  try {
    await dynamoDB.send(
      new DeleteCommand({
        TableName: table,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error(`Error deleting item from ${table}:`, error)
    throw error
  }
}

export const batchWrite = async (table, items, operation = 'Put') => {
  try {
    const requests = items.map((item) => ({
      [operation]: {
        Item: item,
      },
    }))

    await dynamoDB.send(
      new BatchWriteCommand({
        RequestItems: {
          [table]: requests,
        },
      })
    )
    return true
  } catch (error) {
    console.error(`Error batch writing to ${table}:`, error)
    throw error
  }
}

export const batchDelete = async (table, keys) => {
  try {
    const requests = keys.map((key) => ({
      DeleteRequest: {
        Key: key,
      },
    }))

    await dynamoDB.send(
      new BatchWriteCommand({
        RequestItems: {
          [table]: requests,
        },
      })
    )
    return true
  } catch (error) {
    console.error(`Error batch deleting from ${table}:`, error)
    throw error
  }
}
