import express from 'express'
import {
  createNewBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  inviteUser,
  returnBoardRelatedUsers,
  getUserBoards,
  removeBoardFromUser,
} from '../service/boards.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Board:
 *       type: object
 *       required:
 *         - title
 *         - admin
 *         - users
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the board
 *         title:
 *           type: string
 *           description: The board title
 *         admin:
 *           type: string
 *           description: The admin's user ID
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs
 *         visibility:
 *           type: string
 *           enum: [private, public]
 *           description: The board visibility
 *         coverPhoto:
 *           type: string
 *           description: URL of the board cover photo
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date when the board was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date when the board was last updated
 */

/**
 * @swagger
 * /board:
 *   post:
 *     summary: Create a new board
 *     tags: [Board]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       200:
 *         description: Board created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const board = await createNewBoard(req.body)
    res.status(200).json({
      statusCode: 200,
      message: 'Board created successfully',
      data: board,
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
 * /board/{id}:
 *   get:
 *     summary: Get board details
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     responses:
 *       200:
 *         description: Board details retrieved successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const board = await getBoard(req.params.id)
    res.status(200).json({
      statusCode: 200,
      data: board,
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
 * /board/{id}:
 *   put:
 *     summary: Update board details
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Board'
 *     responses:
 *       200:
 *         description: Board updated successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.put('/update/:id', async (req, res) => {
  try {
    const board = await updateBoard(req.params.id, req.body)
    res.status(200).json({
      statusCode: 200,
      message: 'Board updated successfully',
      data: board,
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
 * /board/{id}:
 *   delete:
 *     summary: Delete a board
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    await deleteBoard(req.params.id)
    res.status(200).json({
      statusCode: 200,
      message: 'Board deleted successfully',
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
 * /board/invite:
 *   post:
 *     summary: Invite a user to the board
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: The user's address to invite
 *     responses:
 *       200:
 *         description: User invited successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.put('/invite', async (req, res) => {
  try {
    const { address, boardId } = req.body
    if (!address) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Address is required',
      })
    }

    const data = await inviteUser(boardId, address)
    res.status(200).json({
      statusCode: 200,
      message: 'User invited successfully',
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

/**
 * @swagger
 * /board/users:
 *   post:
 *     summary: Get board related users
 *     tags: [Board]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userList
 *             properties:
 *               userList:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/users', async (req, res) => {
  try {
    const { userList } = req.body
    if (!userList || !Array.isArray(userList)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'User list is required and must be an array',
      })
    }

    const users = await returnBoardRelatedUsers(userList)
    res.status(200).json({
      statusCode: 200,
      data: users,
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
 * /board/user/{userId}:
 *   get:
 *     summary: Get user's boards
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User's boards retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const boards = await getUserBoards(req.params.userId)
    res.status(200).json({
      statusCode: 200,
      data: boards,
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
 * /board/{id}/remove-user:
 *   delete:
 *     summary: Remove a user from the board
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The board id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The user ID to remove
 *     responses:
 *       200:
 *         description: User removed successfully
 *       404:
 *         description: Board not found
 *       500:
 *         description: Server error
 */
router.delete('/:id/remove-user', async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    const data = await removeBoardFromUser(req.params.id, userId)
    res.status(200).json({
      statusCode: 200,
      message: 'User removed successfully',
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
