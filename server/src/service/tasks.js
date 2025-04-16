import { ENTITY_TYPES, keys } from '../config/tables.js'
import {
  createItem,
  deleteItem,
  queryByIndex,
  queryItems,
  updateItem,
} from '../utils/dynamodb.js'

export const createTask = async (boardId, listId, task, taskIds) => {
  try {
    // Generate a unique ID for the task

    const taskData = {
      pk: `BOARD#${boardId}`,
      sk: `TASK#${task.id}`,
      id: task.id,
      boardId,
      listId,
      title: task.title,
      assignee: task.assignee || 'null',
      entityType: ENTITY_TYPES.TASK,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(taskData)

    await updateItem({
      key: keys.list(boardId, listId),
      updateExpression: 'SET #taskIds = :taskIds, updatedAt = :updatedAt',
      expressionAttributeNames: {
        '#taskIds': 'taskIds',
      },
      expressionAttributeValues: {
        ':taskIds': taskIds,
        ':updatedAt': new Date().toISOString(),
      },
    })

    return taskData
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const getBoardTasks = async (boardId) => {
  try {
    const tasks = await queryItems({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk_prefix)',
      expressionAttributeValues: {
        ':pk': `BOARD#${boardId}`,
        ':sk_prefix': 'TASK#',
      },
    })
    return tasks.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error getting board tasks:', error)
    throw error
  }
}

export const getListTasks = async (boardId, listId) => {
  try {
    const tasks = await queryItems({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk_prefix)',
      filterExpression: 'listId = :listId',
      expressionAttributeValues: {
        ':pk': `BOARD#${boardId}`,
        ':sk_prefix': 'TASK#',
        ':listId': listId,
      },
    })
    return tasks.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error getting list tasks:', error)
    throw error
  }
}

export const getTasksByAssignee = async (userId) => {
  try {
    const tasks = await queryByIndex({
      indexName: 'AssigneeIndex',
      keyConditionExpression: 'assignee = :assignee',
      expressionAttributeValues: {
        ':assignee': userId,
      },
    })
    return tasks
  } catch (error) {
    console.error('Error getting tasks by assignee:', error)
    throw error
  }
}

export const updateTask = async (boardId, taskId, property, data) => {
  try {
    const updatedTask = await updateItem({
      key: keys.task(boardId, taskId),
      updateExpression: 'SET #property = :data, updatedAt = :updatedAt',
      expressionAttributeNames: {
        '#property': property,
      },
      expressionAttributeValues: {
        ':data': data,
        ':updatedAt': new Date().toISOString(),
      },
    })

    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export const deleteTask = async (boardId, taskId) => {
  try {
    await deleteItem(keys.task(boardId, taskId))
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

export const reorderTasks = async (boardId, listId, taskIds) => {
  try {
    await updateItem({
      key: keys.list(boardId, listId),
      updateExpression: 'SET #taskIds = :taskIds, updatedAt = :updatedAt',
      expressionAttributeNames: {
        '#taskIds': 'taskIds',
      },
      expressionAttributeValues: {
        ':taskIds': taskIds,
        ':updatedAt': new Date().toISOString(),
      },
    })
    return true
  } catch (error) {
    console.error('Error reordering tasks:', error)
    throw error
  }
}

export const switchTasks = async (boardId, lists) => {
  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, list] of Object.entries(lists)) {
      console.log(id, {
        key: keys.list(boardId, list.id),
        updateExpression: 'SET #taskIds = :taskIds, updatedAt = :updatedAt',
        expressionAttributeNames: {
          '#taskIds': 'taskIds',
        },
        expressionAttributeValues: {
          ':taskIds': list.taskIds,
          ':updatedAt': new Date().toISOString(),
        },
      })
      // eslint-disable-next-line no-await-in-loop
      await updateItem({
        key: keys.list(boardId, list.id),
        updateExpression: 'SET #taskIds = :taskIds, updatedAt = :updatedAt',
        expressionAttributeNames: {
          '#taskIds': 'taskIds',
        },
        expressionAttributeValues: {
          ':taskIds': list.taskIds,
          ':updatedAt': new Date().toISOString(),
        },
      })
    }

    return true
  } catch (error) {
    console.error('Error reordering tasks:', error)
    throw error
  }
}
