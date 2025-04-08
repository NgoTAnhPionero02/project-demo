import express from 'express'
import {
  createNewTask,
  reorderTasksInSameList,
  switchTasksBetweenLists,
  updateTaskProperty,
} from '../service/task.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - boardId
 *         - listId
 *         - task
 *         - taskIds
 *       properties:
 *         boardId:
 *           type: string
 *           description: The board's ID
 *         listId:
 *           type: string
 *           description: The list's ID
 *         task:
 *           type: object
 *           description: The task object
 *         taskIds:
 *           type: array
 *           items:
 *             type: string
 *           description: The order of tasks
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
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { boardId, task, listId, taskIds } = req.body
    if (!boardId || !task || !listId || !taskIds) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await createNewTask(boardId, task, listId, taskIds)
    res.status(200).json({
      statusCode: 200,
      data,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

/**
 * @swagger
 * /task/reorder:
 *   put:
 *     summary: Reorder tasks in the same list
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - listId
 *               - taskIds
 *             properties:
 *               boardId:
 *                 type: string
 *               listId:
 *                 type: string
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tasks reordered successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.put('/reorder', async (req, res) => {
  try {
    const { boardId, listId, taskIds } = req.body
    if (!boardId || !listId || !taskIds) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await reorderTasksInSameList(boardId, listId, taskIds)
    res.status(200).json({
      statusCode: 200,
      data,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

/**
 * @swagger
 * /task/switch:
 *   put:
 *     summary: Switch tasks between lists
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - lists
 *             properties:
 *               boardId:
 *                 type: string
 *               lists:
 *                 type: object
 *                 additionalProperties:
 *                   type: array
 *                   items:
 *                     type: string
 *     responses:
 *       200:
 *         description: Tasks switched successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.put('/switch', async (req, res) => {
  try {
    const { boardId, lists } = req.body
    if (!boardId || !lists) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await switchTasksBetweenLists(boardId, lists)
    res.status(200).json({
      statusCode: 200,
      data,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

/**
 * @swagger
 * /task/{taskId}:
 *   put:
 *     summary: Update task property
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - property
 *               - data
 *             properties:
 *               boardId:
 *                 type: string
 *               property:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.put('/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params
    const { boardId, property, data } = req.body
    if (!taskId || !boardId || !property || !data) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const result = await updateTaskProperty(boardId, taskId, property, data)
    res.status(200).json({
      statusCode: 200,
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

export default router
