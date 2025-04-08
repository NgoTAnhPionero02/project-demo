import express from 'express'
import {
  createNewList,
  reorderLists,
  renameList,
  removeList,
} from '../service/lists.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       required:
 *         - boardId
 *         - list
 *         - listOrder
 *       properties:
 *         boardId:
 *           type: string
 *           description: The board's ID
 *         list:
 *           type: object
 *           description: The list object
 *         listOrder:
 *           type: array
 *           items:
 *             type: string
 *           description: The order of lists
 */

/**
 * @swagger
 * /list:
 *   post:
 *     summary: Create a new list
 *     tags: [List]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/List'
 *     responses:
 *       200:
 *         description: List created successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

// Create a new list
router.post('/', async (req, res) => {
  try {
    const { boardId, list, listOrder } = req.body
    if (!boardId || !list || !listOrder) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await createNewList(boardId, list, listOrder)
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
 * /list/reorder:
 *   put:
 *     summary: Reorder lists
 *     tags: [List]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - listOrder
 *             properties:
 *               boardId:
 *                 type: string
 *               listOrder:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lists reordered successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

// Reorder lists
router.put('/reorder', async (req, res) => {
  try {
    const { boardId, listOrder } = req.body
    if (!boardId || !listOrder) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await reorderLists(boardId, listOrder)
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
 * /list/{listId}:
 *   put:
 *     summary: Rename a list
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: listId
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
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: List renamed successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

// Rename a list
router.put('/:listId', async (req, res) => {
  try {
    const { listId } = req.params
    const { title } = req.body
    if (!listId || !title) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await renameList(listId, title)
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
 * /list/{listId}:
 *   delete:
 *     summary: Remove a list
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List removed successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */

// Remove a list
router.delete('/:listId', async (req, res) => {
  try {
    const { listId } = req.params
    if (!listId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const data = await removeList(listId)
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

export default router
