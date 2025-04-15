import express from 'express'
import {
  createAttachment,
  deleteAttachment,
  getPresignedUploadUrl,
  getTaskAttachments,
} from '../service/attachments.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the attachment
 *         taskId:
 *           type: string
 *           description: The task ID this attachment belongs to
 *         fileName:
 *           type: string
 *           description: The original file name
 *         s3Key:
 *           type: string
 *           description: The S3 key where the file is stored
 *         contentType:
 *           type: string
 *           description: The MIME type of the file
 *         size:
 *           type: number
 *           description: The size of the file in bytes
 *         url:
 *           type: string
 *           description: The signed URL to access the file
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /attachment/upload-url:
 *   post:
 *     summary: Get a presigned URL for direct upload to S3
 *     tags: [Attachment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Original file name
 *               contentType:
 *                 type: string
 *                 description: MIME type of the file
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: The presigned URL for direct upload
 *                 fileId:
 *                   type: string
 *                   description: Generated file ID
 *                 fileName:
 *                   type: string
 *                   description: Original file name
 *                 s3Key:
 *                   type: string
 *                   description: S3 key for the file
 *                 contentType:
 *                   type: string
 *                   description: MIME type of the file
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/upload-url', async (req, res) => {
  try {
    const { fileName, contentType } = req.body

    if (!fileName || !contentType) {
      return res.status(400).json({
        statusCode: 400,
        message: 'fileName and contentType are required',
      })
    }

    const result = await getPresignedUploadUrl(fileName, contentType)

    res.status(200).json({
      statusCode: 200,
      message: 'Presigned URL generated successfully',
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
 * /attachment:
 *   post:
 *     summary: Create an attachment record after successful upload to S3
 *     tags: [Attachment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskId
 *               - fileName
 *               - s3Key
 *               - contentType
 *               - size
 *             properties:
 *               taskId:
 *                 type: string
 *                 description: The task ID this attachment belongs to
 *               id:
 *                 type: string
 *                 description: Optional ID for the attachment
 *               fileName:
 *                 type: string
 *                 description: Original file name
 *               s3Key:
 *                 type: string
 *                 description: S3 key where the file is stored
 *               contentType:
 *                 type: string
 *                 description: MIME type of the file
 *               size:
 *                 type: number
 *                 description: Size of the file in bytes
 *     responses:
 *       201:
 *         description: Attachment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attachment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res) => {
  try {
    const { taskId, id, fileName, s3Key, contentType, size } = req.body

    if (!taskId || !fileName || !s3Key || !contentType) {
      return res.status(400).json({
        statusCode: 400,
        message: 'taskId, fileName, s3Key, and contentType are required',
      })
    }

    const attachment = await createAttachment({
      id,
      taskId,
      fileName,
      s3Key,
      contentType,
      size: size || 0,
    })

    res.status(201).json({
      statusCode: 201,
      message: 'Attachment created successfully',
      data: attachment,
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
 * /attachment/task/{taskId}:
 *   get:
 *     summary: Get all attachments for a task
 *     tags: [Attachment]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attachment'
 *       500:
 *         description: Server error
 */
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params

    const attachments = await getTaskAttachments(taskId)

    res.status(200).json({
      statusCode: 200,
      data: attachments,
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
 * /attachment/{attachmentId}/task/{taskId}:
 *   delete:
 *     summary: Delete an attachment
 *     tags: [Attachment]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: The task ID
 *       - in: path
 *         name: attachmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The attachment ID
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
 *       404:
 *         description: Attachment not found
 *       500:
 *         description: Server error
 */
router.delete('/:attachmentId/task/:taskId', async (req, res) => {
  try {
    const { attachmentId, taskId } = req.params

    await deleteAttachment(taskId, attachmentId)

    res.status(200).json({
      statusCode: 200,
      message: 'Attachment deleted successfully',
    })
  } catch (error) {
    if (error.message === 'Attachment not found') {
      return res.status(404).json({
        statusCode: 404,
        message: error.message,
      })
    }
    res.status(500).json({
      statusCode: 500,
      message: error.message,
      error,
    })
  }
})

export default router
