import { ENTITY_TYPES } from '../config/tables.js'
import {
  createItem,
  deleteItem,
  getItem,
  queryItems,
  updateItem,
} from '../utils/dynamodb.js'
import createUniqueId from './common.js'

// Create a new list
export const createList = async (boardId, listData) => {
  try {
    // Generate a unique ID for the list
    const listId = await createUniqueId()

    const list = {
      pk: `BOARD#${boardId}`,
      sk: `LIST#${listId}`,
      id: listId,
      boardId,
      title: listData.title,
      order: listData.order,
      taskIds: listData.taskIds || [],
      entityType: ENTITY_TYPES.LIST,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(list)
    return list
  } catch (error) {
    console.error('Error creating list:', error)
    throw error
  }
}

export const getBoardLists = async (boardId) => {
  try {
    const lists = await queryItems({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk_prefix)',
      expressionAttributeValues: {
        ':pk': `BOARD#${boardId}`,
        ':sk_prefix': 'LIST#',
      },
    })
    return lists.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error getting board lists:', error)
    throw error
  }
}

export const updateList = async (boardId, listId, updateData) => {
  try {
    const list = await getItem({
      pk: `BOARD#${boardId}`,
      sk: `LIST#${listId}`,
    })

    if (!list) {
      throw new Error('List not found')
    }

    const updateExpression = []
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString(),
    }

    if (updateData.title) {
      updateExpression.push('title = :title')
      expressionAttributeValues[':title'] = updateData.title
    }

    if (updateData.order !== undefined) {
      updateExpression.push('order = :order')
      expressionAttributeValues[':order'] = updateData.order
    }

    if (updateData.taskIds) {
      updateExpression.push('taskIds = :taskIds')
      expressionAttributeValues[':taskIds'] = updateData.taskIds
    }

    if (updateExpression.length === 0) {
      return list
    }

    const updatedList = await updateItem({
      key: {
        pk: `BOARD#${boardId}`,
        sk: `LIST#${listId}`,
      },
      updateExpression: `SET ${updateExpression.join(', ')}`,
      expressionAttributeValues,
      expressionAttributeNames: {
        '#updatedAt': 'updatedAt',
      },
    })

    return updatedList
  } catch (error) {
    console.error('Error updating list:', error)
    throw error
  }
}

export const deleteList = async (boardId, listId) => {
  try {
    await deleteItem({
      pk: `BOARD#${boardId}`,
      sk: `LIST#${listId}`,
    })
    return true
  } catch (error) {
    console.error('Error deleting list:', error)
    throw error
  }
}

export const reorderLists = async (boardId, lists) => {
  try {
    const updatePromises = lists.map((list, index) => updateItem({
      key: {
        pk: `BOARD#${boardId}`,
        sk: `LIST#${list.id}`,
      },
      updateExpression: 'SET order = :order, updatedAt = :updatedAt',
      expressionAttributeValues: {
        ':order': index,
        ':updatedAt': new Date().toISOString(),
      },
    }))

    await Promise.all(updatePromises)
    return true
  } catch (error) {
    console.error('Error reordering lists:', error)
    throw error
  }
}

export const updateListTasks = async (boardId, listId, taskIds) => {
  try {
    await updateItem({
      key: {
        pk: `BOARD#${boardId}`,
        sk: `LIST#${listId}`,
      },
      updateExpression: 'SET taskIds = :taskIds, updatedAt = :updatedAt',
      expressionAttributeValues: {
        ':taskIds': taskIds,
        ':updatedAt': new Date().toISOString(),
      },
    })
    return true
  } catch (error) {
    console.error('Error updating list tasks:', error)
    throw error
  }
}

export const renameList = async (boardId, listId, title) => {
  try {
    await updateItem({
      key: {
        pk: `BOARD#${boardId}`,
        sk: `LIST#${listId}`,
      },
      updateExpression: 'SET title = :title, updatedAt = :updatedAt',
      expressionAttributeValues: {
        ':title': title,
        ':updatedAt': new Date().toISOString(),
      },
    })
    return true
  } catch (error) {
    console.error('Error renaming list:', error)
    throw error
  }
}
