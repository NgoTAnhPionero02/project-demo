import { TABLES } from '../config/tables.js'
import {
  createItem,
  queryItems,
  updateItem,
  deleteItem,
  batchWrite,
} from '../utils/dynamodb.js'

export const createTask = async (listId, taskData) => {
  try {
    const task = {
      listId,
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      order: taskData.order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await createItem(TABLES.TASKS, task)
    return task
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const getListTasks = async (listId) => {
  try {
    const tasks = await queryItems(TABLES.TASKS, 'listId = :listId', null, {
      ':listId': listId,
    })
    return tasks.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Error getting list tasks:', error)
    throw error
  }
}

export const updateTask = async (listId, taskId, updateData) => {
  try {
    const updateExpression =
      'SET #title = :title, #description = :description, #order = :order, #updatedAt = :updatedAt'
    const expressionValues = {
      ':title': updateData.title,
      ':description': updateData.description,
      ':order': updateData.order,
      ':updatedAt': new Date().toISOString(),
    }
    const expressionNames = {
      '#title': 'title',
      '#description': 'description',
      '#order': 'order',
      '#updatedAt': 'updatedAt',
    }

    const updatedTask = await updateItem(
      TABLES.TASKS,
      { listId, id: taskId },
      updateExpression,
      expressionValues,
      expressionNames
    )

    return updatedTask
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export const deleteTask = async (listId, taskId) => {
  try {
    await deleteItem(TABLES.TASKS, { listId, id: taskId })
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

export const reorderTasks = async (listId, tasks) => {
  try {
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
      updatedAt: new Date().toISOString(),
    }))

    await batchWrite(TABLES.TASKS, updatedTasks)
    return updatedTasks
  } catch (error) {
    console.error('Error reordering tasks:', error)
    throw error
  }
}
