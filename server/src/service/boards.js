import { TABLES } from '../config/tables.js'
import {
  createItem,
  getItem,
  queryItems,
  updateItem,
  deleteItem,
} from '../utils/dynamodb.js'

// Create a new board
export const createNewBoard = async (boardData) => {
  try {
    const board = {
      id: boardData.id,
      title: boardData.title,
      admin: boardData.admin,
      users: boardData.users,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(TABLES.BOARDS, board)
    return board
  } catch (error) {
    console.error('Error creating new board:', error)
    throw error
  }
}

// Get board details
export const getBoard = async (boardId) => {
  try {
    const board = await getItem(TABLES.BOARDS, { id: boardId })
    return board
  } catch (error) {
    console.error('Error getting board:', error)
    throw error
  }
}

// Update board property
export const updateBoard = async (boardId, updateData) => {
  try {
    const updateExpression =
      'SET #title = :title, #users = :users, #updatedAt = :updatedAt'
    const expressionValues = {
      ':title': updateData.title,
      ':users': updateData.users,
      ':updatedAt': new Date().toISOString(),
    }
    const expressionNames = {
      '#title': 'title',
      '#users': 'users',
      '#updatedAt': 'updatedAt',
    }

    const updatedBoard = await updateItem(
      TABLES.BOARDS,
      { id: boardId },
      updateExpression,
      expressionValues,
      expressionNames
    )

    return updatedBoard
  } catch (error) {
    console.error('Error updating board:', error)
    throw error
  }
}

// Delete board
export const deleteBoard = async (boardId) => {
  try {
    await deleteItem(TABLES.BOARDS, { id: boardId })
    return true
  } catch (error) {
    console.error('Error deleting board:', error)
    throw error
  }
}

// Invite user to board
export const inviteUser = async (boardId, address) => {
  try {
    const board = await getItem(TABLES.BOARDS, { id: boardId })
    if (!board) {
      throw new Error('Board not found')
    }

    const updatedUsers = [...board.users, address]
    const updateExpression = 'SET #users = :users, #updatedAt = :updatedAt'
    const expressionValues = {
      ':users': updatedUsers,
      ':updatedAt': new Date().toISOString(),
    }
    const expressionNames = {
      '#users': 'users',
      '#updatedAt': 'updatedAt',
    }

    await updateItem(
      TABLES.BOARDS,
      { id: boardId },
      updateExpression,
      expressionValues,
      expressionNames
    )

    return { boardId, users: updatedUsers }
  } catch (error) {
    console.error('Error inviting user to board:', error)
    throw error
  }
}

// Get board related users
export const returnBoardRelatedUsers = async (userList) => {
  try {
    const users = await queryItems(TABLES.USERS, 'id IN :userList', null, {
      ':userList': userList,
    })
    return users
  } catch (error) {
    console.error('Error getting board related users:', error)
    throw error
  }
}

// Get user's boards
export const getUserBoards = async (userId) => {
  try {
    const boards = await queryItems(
      TABLES.BOARDS,
      'contains(users, :userId)',
      null,
      { ':userId': userId }
    )
    return boards
  } catch (error) {
    console.error('Error getting user boards:', error)
    throw error
  }
}

// Remove user from board
export const removeBoardFromUser = async (boardId, userId) => {
  try {
    const board = await getItem(TABLES.BOARDS, { id: boardId })
    if (!board) {
      throw new Error('Board not found')
    }

    const updatedUsers = board.users.filter((uid) => uid !== userId)
    const updateExpression = 'SET #users = :users, #updatedAt = :updatedAt'
    const expressionValues = {
      ':users': updatedUsers,
      ':updatedAt': new Date().toISOString(),
    }
    const expressionNames = {
      '#users': 'users',
      '#updatedAt': 'updatedAt',
    }

    await updateItem(
      TABLES.BOARDS,
      { id: boardId },
      updateExpression,
      expressionValues,
      expressionNames
    )

    return { boardId, users: updatedUsers }
  } catch (error) {
    console.error('Error removing user from board:', error)
    throw error
  }
}
