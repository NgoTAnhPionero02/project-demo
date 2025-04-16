import { ENTITY_TYPES, keys } from '../config/tables.js'
import {
  createItem,
  getItem,
  queryByIndex,
  queryItems,
} from '../utils/dynamodb.js'

// Create a new user
export const createNewUser = async (uid, email, name) => {
  try {
    const userData = {
      pk: `USER#${uid}`,
      sk: 'METADATA',
      uid,
      email,
      name,
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
    if (!user) return {}

    const listUserBoards = await queryItems({
      keyConditionExpression: 'pk = :user AND begins_with(sk, :sk)',
      expressionAttributeValues: {
        ':user': `USER#${uid}`,
        ':sk': `BOARD#`,
      },
    })

    return { ...user, boards: listUserBoards }
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
