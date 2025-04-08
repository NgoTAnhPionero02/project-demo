import dynamoDB from '../config/dynamodb.js'
import { PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb'

// Create a unique ID using DynamoDB
export const createUniqueId = async () => {
  try {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const uniqueId = `${timestamp}-${random}`

    await dynamoDB.send(
      new PutCommand({
        TableName: 'UniqueIds',
        Item: {
          id: uniqueId,
          createdAt: new Date().toISOString(),
        },
      })
    )

    return uniqueId
  } catch (error) {
    console.error('Error creating unique ID:', error)
    throw error
  }
}

export const getUniqueId = async (id) => {
  try {
    const result = await dynamoDB.send(
      new GetCommand({
        TableName: 'UniqueIds',
        Key: { id },
      })
    )

    return result.Item
  } catch (error) {
    console.error('Error getting unique ID:', error)
    throw error
  }
}
