import { v4 as uuidv4 } from 'uuid'

// Create a unique ID using DynamoDB
export default async function createUniqueId() {
  try {
    const uniqueId = uuidv4()

    return uniqueId
  } catch (error) {
    console.error('Error creating unique ID:', error)
    throw error
  }
}
