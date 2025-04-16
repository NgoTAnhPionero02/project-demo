import express from 'express'
import {
  createTask,
  getListTasks,
  updateTask,
  deleteTask,
  reorderTasks,
  switchTasks,
} from '../service/tasks.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - listId
 *         - title
 *         - order
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the task
 *         listId:
 *           type: string
 *           description: The list id this task belongs to
 *         title:
 *           type: string
 *           description: The task title
 *         description:
 *           type: string
 *           description: The task description
 *         order:
 *           type: number
 *           description: The order of the task in the list
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the task was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the task was last updated
 */

/**
 * @swagger
 * /task:
 *   post:
 *     summary: Create a new task
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { boardId, listId, task, taskIds } = req.body
    if (!listId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'List ID is required',
      })
    }

    const result = await createTask(boardId, listId, task, taskIds)
    res.status(200).json({
      statusCode: 200,
      message: 'Task created successfully',
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

/**
 * @swagger
 * /task/list/{listId}:
 *   get:
 *     summary: Get all tasks in a list
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: listId
 *         schema:
 *           type: string
 *         required: true
 *         description: The list id
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
router.get('/list/:listId', async (req, res) => {
  try {
    const tasks = await getListTasks(req.params.listId)
    res.status(200).json({
      statusCode: 200,
      data: tasks,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

/**
 * @swagger
 * /task/update:
 *   put:
 *     summary: Update a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.put('/update', async (req, res) => {
  try {
    const { boardId, taskId, property, data } = req.body

    const task = await updateTask(boardId, taskId, property, data)
    res.status(200).json({
      statusCode: 200,
      message: 'Task updated successfully',
      data: task,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

/**
 * @swagger
 * /task/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { listId } = req.body
    if (!listId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'List ID is required',
      })
    }

    await deleteTask(listId, req.params.id)
    res.status(200).json({
      statusCode: 200,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

/**
 * @swagger
 * /task/reorder:
 *   put:
 *     summary: Reorder tasks in a list
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - tasks
 *             properties:
 *               listId:
 *                 type: string
 *                 description: The list id
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *                 description: Array of tasks with updated order
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/reorder', async (req, res) => {
  try {
    const { boardId, listId, taskIds } = req.body
    if (!listId || !taskIds || !Array.isArray(taskIds)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'List ID and tasks array are required',
      })
    }

    const updatedTasks = await reorderTasks(boardId, listId, taskIds)
    res.status(200).json({
      statusCode: 200,
      message: 'Tasks reordered successfully',
      data: updatedTasks,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

/**
 * @swagger
 * /task/reorder:
 *   put:
 *     summary: Reorder tasks in a list
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listId
 *               - tasks
 *             properties:
 *               listId:
 *                 type: string
 *                 description: The list id
 *               tasks:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Task'
 *                 description: Array of tasks with updated order
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/switch', async (req, res) => {
  try {
    const { boardId, lists } = req.body

    const updatedTasks = await switchTasks(boardId, lists)
    res.status(200).json({
      statusCode: 200,
      message: 'Tasks reordered successfully',
      data: updatedTasks,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

export default router
