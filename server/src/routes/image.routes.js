import express from 'express'
import { getImages, saveImages } from '../service/images.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         url:
 *           type: string
 *         description:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

/**
 * @swagger
 * /image:
 *   get:
 *     summary: Get all images
 *     tags: [Image]
 *     responses:
 *       200:
 *         description: Images retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Image'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const images = await getImages()
    res.status(200).json({
      statusCode: 200,
      data: images,
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
 * /image:
 *   post:
 *     summary: Save images
 *     tags: [Image]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Image'
 *     responses:
 *       200:
 *         description: Images saved successfully
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { images } = req.body
    if (!Array.isArray(images)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Images must be an array',
      })
    }

    await saveImages(images)
    res.status(200).json({
      statusCode: 200,
      message: 'Images saved successfully',
    })
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      error,
    })
  }
})

export default router
