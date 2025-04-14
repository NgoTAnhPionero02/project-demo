import { ENTITY_TYPES, keys } from '../config/tables.js'
import { createItem, getItem, queryByIndex } from '../utils/dynamodb.js'
import createUniqueId from './common.js'

// Create a new user
export const createNewUser = async (email, name, picture) => {
  try {
    const uid = await createUniqueId()

    const userData = {
      pk: `USER#${uid}`,
      sk: 'METADATA',
      uid,
      email,
      name,
      picture,
      entityType: ENTITY_TYPES.USER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(userData)
    return userData
  } catch (error) {
    console.error('Error creating new user:', error)
    throw error
  }
}

// Return user data by ID
export const returnUserData = async (uid) => {
  try {
    const user = await getItem(keys.user(uid))
    return user
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

// Get user data by email
export const getUserDataByEmail = async (email) => {
  try {
    const user = await queryByIndex({
      indexName: 'EmailIndex',
      keyConditionExpression: 'email = :email',
      expressionAttributeValues: {
        ':email': email,
      },
    })

    if (!user || user.length === 0) {
      return null
    }

    return user[0]
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

// Find user by email
export const findUserByEmail = async (email) => {
  try {
    const users = await queryByIndex({
      indexName: 'EmailIndex',
      keyConditionExpression: 'email = :email',
      expressionAttributeValues: {
        ':email': email,
      },
    })

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error('Error finding user by email:', error)
    throw error
  }
}
