import express from 'express'
import {
  createList,
  getBoardLists,
  updateList,
  deleteList,
  reorderLists,
  renameList,
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
 *         - title
 *         - order
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the list
 *         boardId:
 *           type: string
 *           description: The board id this list belongs to
 *         title:
 *           type: string
 *           description: The list title
 *         order:
 *           type: number
 *           description: The order of the list in the board
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the list was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the list was last updated
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
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { boardId, ...listData } = req.body
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    const list = await createList(boardId, listData)
    res.status(200).json({
      statusCode: 200,
      message: 'List created successfully',
      data: list,
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
 * /list/board/{boardId}:
 *   get:
 *     summary: Get all lists in a board
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     responses:
 *       200:
 *         description: Lists retrieved successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.get('/board/:boardId', async (req, res) => {
  try {
    const lists = await getBoardLists(req.params.boardId)
    res.status(200).json({
      statusCode: 200,
      data: lists,
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
 * /list/{id}:
 *   put:
 *     summary: Update a list
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The list id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/List'
 *     responses:
 *       200:
 *         description: List updated successfully
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    const { boardId, ...updateData } = req.body
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    const list = await updateList(boardId, req.params.id, updateData)
    res.status(200).json({
      statusCode: 200,
      message: 'List updated successfully',
      data: list,
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
 * /list/{id}:
 *   delete:
 *     summary: Delete a list
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The list id
 *     responses:
 *       200:
 *         description: List deleted successfully
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const { boardId } = req.body
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    await deleteList(boardId, req.params.id)
    res.status(200).json({
      statusCode: 200,
      message: 'List deleted successfully',
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
 * /list/reorder:
 *   put:
 *     summary: Reorder lists in a board
 *     tags: [List]
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
 *                 description: The board id
 *               lists:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/List'
 *                 description: Array of lists with updated order
 *     responses:
 *       200:
 *         description: Lists reordered successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/reorder', async (req, res) => {
  try {
    const { boardId, lists } = req.body
    if (!boardId || !lists || !Array.isArray(lists)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID and lists array are required',
      })
    }

    const updatedLists = await reorderLists(boardId, lists)
    res.status(200).json({
      statusCode: 200,
      message: 'Lists reordered successfully',
      data: updatedLists,
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
 * /list/rename/{id}:
 *   put:
 *     summary: Rename a list
 *     tags: [List]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The list id
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
 *                 description: The new title for the list
 *     responses:
 *       200:
 *         description: List renamed successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/rename/:id', async (req, res) => {
  try {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Title is required',
      })
    }

    const data = await renameList(req.params.id, title)
    res.status(200).json({
      statusCode: 200,
      message: 'List renamed successfully',
      data,
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
