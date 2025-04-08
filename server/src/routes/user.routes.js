import express from 'express'
import { createNewUser, returnUserData } from '../service/auth.js'
import {
  removeBoardFromUser,
  returnUserRelatedBoards,
} from '../service/boards.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - uid
 *         - email
 *         - name
 *       properties:
 *         uid:
 *           type: string
 *           description: The user's unique ID
 *         email:
 *           type: string
 *           description: The user's email
 *         name:
 *           type: string
 *           description: The user's name
 *         picture:
 *           type: string
 *           description: The user's profile picture URL
 */

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { uid, email, name, picture } = req.body
    if (!uid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UID is undefined',
      })
    }

    const data = await createNewUser(uid, email, name, picture)
    res.status(200).json({
      statusCode: 200,
      message: 'User created successfully!',
      data,
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Couldn't create a user!",
      error,
    })
  }
})

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get user data
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { uid } = req.query
    if (!uid) {
      return res.status(400).json({
        statusCode: 400,
        message: 'UID is undefined!',
      })
    }

    const userData = await returnUserData(uid)
    if (userData) {
      res.status(200).json({
        statusCode: 200,
        userData,
      })
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

/**
 * @swagger
 * /user/boards:
 *   put:
 *     summary: Remove user from board
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - userId
 *             properties:
 *               boardId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User removed from board successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/boards', async (req, res) => {
  try {
    const { boardId, userId } = req.body
    if (!boardId || !userId) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board ID and User ID are required',
      })
    }

    const result = await removeBoardFromUser(boardId, userId)
    res.status(200).json({
      statusCode: 200,
      message: 'User removed from board successfully',
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
 * /user/boards:
 *   post:
 *     summary: Get user's boards
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardList
 *             properties:
 *               boardList:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User boards retrieved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/boards', async (req, res) => {
  try {
    const { boardList } = req.body
    if (!boardList || !Array.isArray(boardList)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Board list must be an array',
      })
    }

    const boards = await returnUserRelatedBoards(boardList)
    res.status(200).json({
      statusCode: 200,
      message: 'User boards retrieved successfully',
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

export default router
