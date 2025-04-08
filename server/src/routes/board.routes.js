import express from 'express'
import {
  createNewBoard,
  getBoardDetails,
  updateBoardProperty,
  deleteBoard,
  inviteUser,
  returnBoardRelatedUsers,
  returnUserRelatedBoards,
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
 *         - admin
 *         - title
 *         - users
 *       properties:
 *         admin:
 *           type: string
 *           description: The admin user's ID
 *         title:
 *           type: string
 *           description: The board's title
 *         coverPhoto:
 *           type: string
 *           description: The board's cover photo URL
 *         visibility:
 *           type: string
 *           description: The board's visibility setting
 *         users:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs with access to the board
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
    const { admin, title, coverPhoto, visibility, users } = req.body
    if (!users) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Users are undefined',
      })
    }

    const data = await createNewBoard(
      admin,
      title,
      coverPhoto,
      visibility,
      users
    )
    res.status(200).json({
      statusCode: 200,
      message: 'Board created successfully!',
      data,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Couldn't create a board!",
      error,
    })
  }
})

/**
 * @swagger
 * /board/{boardId}:
 *   get:
 *     summary: Get board details
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board details retrieved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    const boardData = await getBoardDetails(boardId)
    res.status(200).json({
      statusCode: 200,
      message: 'Board details retrieved successfully',
      data: boardData,
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
 * /board/{boardId}:
 *   put:
 *     summary: Update board property
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property
 *               - data
 *             properties:
 *               property:
 *                 type: string
 *                 description: Property name to update
 *               data:
 *                 type: object
 *                 description: New property value
 *     responses:
 *       200:
 *         description: Board updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params
    const { property, data } = req.body

    if (!boardId || !property || !data) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const result = await updateBoardProperty(boardId, property, data)
    res.status(200).json({
      statusCode: 200,
      message: 'Board updated successfully',
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
 * /board/{boardId}:
 *   delete:
 *     summary: Delete board
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.delete('/:boardId', async (req, res) => {
  try {
    const { boardId } = req.params
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    const result = await deleteBoard(boardId)
    res.status(200).json({
      statusCode: 200,
      message: result.message,
      data: { boardId },
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
 * /board/{boardId}/invite:
 *   post:
 *     summary: Invite user to board
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
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
 *                 description: User's address to invite
 *     responses:
 *       200:
 *         description: User invited successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/:boardId/invite', async (req, res) => {
  try {
    const { boardId } = req.params
    const { address } = req.body

    if (!boardId || !address) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID and user address are required',
      })
    }

    const result = await inviteUser(boardId, address)
    res.status(200).json({
      statusCode: 200,
      message: 'User invited successfully',
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
 * /board/{boardId}/users:
 *   get:
 *     summary: Get board users
 *     tags: [Board]
 *     parameters:
 *       - in: path
 *         name: boardId
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board users retrieved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/:boardId/users', async (req, res) => {
  try {
    const { boardId } = req.params
    if (!boardId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID is required',
      })
    }

    const boardData = await getBoardDetails(boardId)
    const users = await returnBoardRelatedUsers(boardData.users)

    res.status(200).json({
      statusCode: 200,
      message: 'Board users retrieved successfully',
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

// Get user's boards
router.post('/user-boards', async (req, res) => {
  try {
    const { boardList } = req.body
    if (!boardList || boardList.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board list is undefined!',
      })
    }

    const boardData = await returnUserRelatedBoards(boardList)
    res.status(200).json({
      statusCode: 200,
      boardData,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

// Remove user from board
router.delete('/:boardId/users/:userId', async (req, res) => {
  try {
    const { boardId, userId } = req.params
    if (!boardId || !userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Missing required parameters',
      })
    }

    const result = await removeBoardFromUser(boardId, userId)
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
