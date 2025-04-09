import { ENTITY_TYPES, keys } from '../config/tables.js'
import {
  batchWrite,
  createItem,
  deleteItem,
  queryByIndex,
  queryItems,
  updateItem,
} from '../utils/dynamodb.js'
import createUniqueId from './common.js'

export const createTask = async (boardId, taskData) => {
  try {
    // Generate a unique ID for the task
    const taskId = await createUniqueId()

    const task = {
      pk: `BOARD#${boardId}`,
      sk: `TASK#${taskId}`,
      id: taskId,
      boardId,
      listId: taskData.listId,
      title: taskData.title,
      description: taskData.description || '',
      assignee: taskData.assignee || null,
      dueDate: taskData.dueDate || null,
      labels: taskData.labels || [],
      order: taskData.order,
      entityType: ENTITY_TYPES.TASK,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(task)
    return task
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

export const updateTask = async (boardId, taskId, updateData) => {
  try {
    // Build dynamic update expression based on provided data
    let updateExpression = 'SET';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (updateData.title !== undefined) {
      updateExpression += ' title = :title,';
      expressionAttributeValues[':title'] = updateData.title;
    }

    if (updateData.description !== undefined) {
      updateExpression += ' description = :description,';
      expressionAttributeValues[':description'] = updateData.description;
    }

    if (updateData.order !== undefined) {
      updateExpression += ' order = :order,';
      expressionAttributeValues[':order'] = updateData.order;
    }

    if (updateData.listId !== undefined) {
      updateExpression += ' listId = :listId,';
      expressionAttributeValues[':listId'] = updateData.listId;
    }

    if (updateData.assignee !== undefined) {
      updateExpression += ' assignee = :assignee,';
      expressionAttributeValues[':assignee'] = updateData.assignee;
    }

    if (updateData.dueDate !== undefined) {
      updateExpression += ' dueDate = :dueDate,';
      expressionAttributeValues[':dueDate'] = updateData.dueDate;
    }

    if (updateData.labels !== undefined) {
      updateExpression += ' labels = :labels,';
      expressionAttributeValues[':labels'] = updateData.labels;
    }

    // Always update the updatedAt timestamp
    updateExpression += ' updatedAt = :updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updatedTask = await updateItem({
      key: keys.task(boardId, taskId),
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames,
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

export const reorderTasks = async (boardId, listId, tasks) => {
  try {
    const updatedTasks = tasks.map((task, index) => ({
      pk: `BOARD#${boardId}`,
      sk: `TASK#${task.id}`,
      id: task.id,
      boardId,
      listId,
      title: task.title,
      description: task.description || '',
      assignee: task.assignee || null,
      dueDate: task.dueDate || null,
      labels: task.labels || [],
      order: index,
      entityType: ENTITY_TYPES.TASK,
      updatedAt: new Date().toISOString(),
    }))

    await batchWrite(updatedTasks)
    return updatedTasks
  } catch (error) {
    console.error('Error reordering tasks:', error)
    throw error
  }
}
