import { ENTITY_TYPES, keys } from '../config/tables.js'
import {
  createItem,
  deleteItem,
  getItem,
  queryByIndex,
  queryItems,
  updateItem,
} from '../utils/dynamodb.js'
import createUniqueId from './common.js'

// Create a new board
export const createNewBoard = async (boardData) => {
  try {
    // Generate a unique ID for the board
    const boardId = await createUniqueId()

    // Create board metadata
    const board = {
      pk: `BOARD#${boardId}`,
      sk: 'METADATA',
      id: boardId,
      title: boardData.title,
      admin: boardData.admin,
      coverPhoto: boardData.coverPhoto,
      visibility: boardData.visibility || 'private',
      entityType: ENTITY_TYPES.BOARD,
      listOrder: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(board)

    // Create board-user relationships
    // eslint-disable-next-line no-restricted-syntax, no-unreachable-loop
    for (const user of boardData.users) {
      // eslint-disable-next-line no-await-in-loop
      const userData = await getItem(keys.user(user.uid))

      const userBoardRelation = {
        sk: `BOARD#${boardId}`,
        pk: `USER#${user.uid}`,
        userId: user.uid,
        boardId,
        name: userData.name,
        role: user.uid === boardData.admin ? 'admin' : 'member',
        createdAt: new Date().toISOString(),
      }
      // eslint-disable-next-line no-await-in-loop
      await createItem(userBoardRelation)
    }

    return board
  } catch (error) {
    console.error('Error creating new board:', error)
    throw error
  }
}

// Get board details
export const getBoard = async (boardId) => {
  try {
    const board = await getItem({
      pk: `BOARD#${boardId}`,
      sk: 'METADATA',
    })

    if (!board) {
      return null
    }

    return board
  } catch (error) {
    console.error('Error getting board:', error)
    throw error
  }
}

// Update board property
export const updateBoard = async (boardId, updateData) => {
  try {
    const board = await getItem({
      pk: `BOARD#${boardId}`,
      sk: 'METADATA',
    })

    if (!board) {
      throw new Error('Board not found')
    }

    const updateExpression = []
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString(),
    }

    if (updateData.title) {
      updateExpression.push('title = :title')
      expressionAttributeValues[':title'] = updateData.title
    }

    if (updateData.coverPhoto) {
      updateExpression.push('coverPhoto = :coverPhoto')
      expressionAttributeValues[':coverPhoto'] = updateData.coverPhoto
    }

    if (updateData.visibility) {
      updateExpression.push('visibility = :visibility')
      expressionAttributeValues[':visibility'] = updateData.visibility
    }

    if (updateExpression.length === 0) {
      return board
    }

    const update = await updateItem({
      key: {
        pk: `BOARD#${boardId}`,
        sk: 'METADATA',
      },
      updateExpression: `SET ${updateExpression.join(', ')}`,
      expressionAttributeValues,
      expressionAttributeNames: {
        '#updatedAt': 'updatedAt',
      },
    })

    return update
  } catch (error) {
    console.error('Error updating board:', error)
    throw error
  }
}

// Delete board
export const deleteBoard = async (boardId) => {
  try {
    // Get all users in the board
    const users = await queryItems({
      keyConditionExpression: 'sk = :boardId',
      expressionAttributeValues: {
        ':boardId': `BOARD#${boardId}`,
      },
    })

    // Delete board metadata
    await deleteItem({
      pk: `BOARD#${boardId}`,
      sk: 'METADATA',
    })

    // Delete board-user relationships
    const deletePromises = users.map(
      (user) =>
        // eslint-disable-next-line implicit-arrow-linebreak
        deleteItem({
          pk: user.pk,
          sk: user.sk,
        })
      // eslint-disable-next-line function-paren-newline
    )

    await Promise.all(deletePromises)
    return true
  } catch (error) {
    console.error('Error deleting board:', error)
    throw error
  }
}

// Invite user to board
export const inviteUser = async (boardId, address) => {
  try {
    console.log('AAAAAAAAA', boardId, address)
    const userData = await queryByIndex({
      indexName: 'EmailIndex',
      keyConditionExpression: 'email = :email',
      expressionAttributeValues: {
        ':email': address,
      },
    })

    if (!userData) throw new Error('User not exist')

    console.log('AAAAAAAAAAAAAAAAAAAAAAA', userData)

    const userBoardRelation = {
      pk: `USER#${userData[0].uid}`,
      sk: `BOARD#${boardId}`,
      userId: userData[0].uid,
      boardId,
      name: userData[0].name,
      role: 'member',
      createdAt: new Date().toISOString(),
    }

    await createItem(userBoardRelation)
    return userBoardRelation
  } catch (error) {
    console.error('Error inviting user:', error)
    throw error
  }
}

// Get board related users
export const returnBoardRelatedUsers = async (boardId) => {
  try {
    const users = await queryItems({
      keyConditionExpression: 'sk = :boardId',
      expressionAttributeValues: {
        ':boardId': `BOARD#${boardId}`,
      },
    })

    return users
  } catch (error) {
    console.error('Error getting board users:', error)
    throw error
  }
}

// Get user's boards
export const getUserBoards = async (boardList) => {
  try {
    const boards = []

    // eslint-disable-next-line no-restricted-syntax
    for (const item of boardList) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getItem(keys.board(item))

      if (result) {
        // eslint-disable-next-line no-await-in-loop
        const userData = await queryByIndex({
          indexName: 'UserBoardIndex',
          keyConditionExpression: 'sk = :board AND begins_with(pk, :pk_prefix)',
          expressionAttributeValues: {
            ':board': `BOARD#${item}`,
            ':pk_prefix': 'USER#',
          },
        })

        // eslint-disable-next-line no-await-in-loop
        const listsArray = await queryItems({
          keyConditionExpression:
            'pk = :boardId AND begins_with(sk, :sk_prefix)',
          expressionAttributeValues: {
            ':boardId': `BOARD#${item}`,
            ':sk_prefix': 'LIST#',
          },
        })

        // eslint-disable-next-line no-unused-vars, no-await-in-loop
        const taskArray = await queryItems({
          keyConditionExpression:
            'pk = :boardId AND begins_with(sk, :sk_prefix)',
          expressionAttributeValues: {
            ':boardId': `BOARD#${item}`,
            ':sk_prefix': 'TASK#',
          },
        })

        const lists = listsArray.reduce((acc, list) => {
          acc[list.id] = list
          return acc
        }, {})

        const tasks = taskArray.reduce((acc, list) => {
          acc[list.id] = list
          return acc
        }, {})

        boards.push({ ...result, userData, lists, tasks })
      }
    }

    return boards
  } catch (error) {
    console.error('Error getting user boards:', error)
    throw error
  }
}

// Remove user from board
export const removeBoardFromUser = async (boardId, userId) => {
  try {
    await deleteItem({
      pk: `USER#${userId}`,
      sk: `BOARD#${boardId}`,
    })
    return true
  } catch (error) {
    console.error('Error removing user from board:', error)
    throw error
  }
}
