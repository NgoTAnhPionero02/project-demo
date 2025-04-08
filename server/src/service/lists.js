import { TABLES } from '../config/tables.js'
import {
  createItem,
  queryItems,
  updateItem,
  deleteItem,
  batchWrite,
} from '../utils/dynamodb.js'

// Create a new list
export const createList = async (boardId, listData) => {
  try {
    const list = {
      boardId,
      id: listData.id,
      title: listData.title,
      order: listData.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(TABLES.LISTS, list)
    return list
  } catch (error) {
    console.error('Error creating list:', error)
    throw error
  }
}

export const getBoardLists = async (boardId) => {
  try {
    const lists = await queryItems(TABLES.LISTS, 'boardId = :boardId', null, {
      ':boardId': boardId,
    })
    return lists.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error getting board lists:', error)
    throw error
  }
}

export const updateList = async (boardId, listId, updateData) => {
  try {
    const updateExpression =
      'SET #title = :title, #order = :order, #updatedAt = :updatedAt'
    const expressionValues = {
      ':title': updateData.title,
      ':order': updateData.order,
      ':updatedAt': new Date().toISOString(),
    }
    const expressionNames = {
      '#title': 'title',
      '#order': 'order',
      '#updatedAt': 'updatedAt',
    }

    const updatedList = await updateItem(
      TABLES.LISTS,
      { boardId, id: listId },
      updateExpression,
      expressionValues,
      expressionNames
    )

    return updatedList
  } catch (error) {
    console.error('Error updating list:', error)
    throw error
  }
}

export const deleteList = async (boardId, listId) => {
  try {
    await deleteItem(TABLES.LISTS, { boardId, id: listId })
    return true
  } catch (error) {
    console.error('Error deleting list:', error)
    throw error
  }
}

export const reorderLists = async (boardId, lists) => {
  try {
    const updatedLists = lists.map((list, index) => ({
      ...list,
      order: index,
      updatedAt: new Date().toISOString(),
    }))

    await batchWrite(TABLES.LISTS, updatedLists)
    return updatedLists
  } catch (error) {
    console.error('Error reordering lists:', error)
    throw error
  }
}

// Rename list
export const renameList = async (listId, title) => {
  const listRef = admin.firestore().collection('lists').doc(listId)
  await listRef.update({
    title,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { listId, title }
}
