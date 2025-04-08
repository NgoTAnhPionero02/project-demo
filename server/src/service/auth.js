import { TABLES } from '../config/tables.js'
import { createItem, getItem } from '../utils/dynamodb.js'

// Create a new user
export const createNewUser = async (uid, email, name, picture) => {
  try {
    const userData = {
      uid,
      email,
      name,
      picture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(TABLES.USERS, userData)
    return userData
  } catch (error) {
    console.error('Error creating new user:', error)
    throw error
  }
}

// Return user data
export const returnUserData = async (uid) => {
  try {
    const user = await getItem(TABLES.USERS, { uid })
    return user
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}
