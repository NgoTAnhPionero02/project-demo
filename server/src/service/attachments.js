import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import dynamoDB from '../config/dynamodb.js'
import s3Client from '../config/s3.js'
import { ENTITY_TYPES, TABLE_NAME } from '../config/tables.js'

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name'

/**
 * Generate a presigned URL for uploading a file directly to S3
 * @param {string} fileName - Original file name
 * @param {string} contentType - MIME type of the file
 * @returns {Object} Object containing the upload URL and file metadata
 */
export const getPresignedUploadUrl = async (fileName, contentType) => {
  try {
    // Generate a unique ID for the file
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create a unique S3 key with a folder structure
    const fileExtension = fileName.split('.').pop()
    const s3Key = `attachments/${fileId}.${fileExtension}`

    // Create the presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Return the presigned URL and metadata
    return {
      uploadUrl,
      fileId,
      fileName,
      s3Key,
      contentType,
    }
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    throw error
  }
}

/**
 * Save attachment metadata to DynamoDB after successful upload
 * @param {Object} attachment - Attachment details including taskId, s3Key, etc.
 * @returns {Object} The saved attachment with URL
 */
export const createAttachment = async (attachment) => {
  try {
    // Generate a unique ID if not provided
    const attachmentId = attachment.id || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    // Create the DynamoDB item
    const attachmentItem = {
      pk: `TASK#${attachment.taskId}`,
      sk: `ATTACHMENT#${attachmentId}`,
      id: attachmentId,
      taskId: attachment.taskId,
      fileName: attachment.fileName,
      s3Key: attachment.s3Key,
      contentType: attachment.contentType,
      size: attachment.size || 0,
      entityType: ENTITY_TYPES.ATTACHMENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: attachmentItem,
      })
    )

    // Generate a signed URL for viewing the attachment
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: attachment.s3Key,
    })
    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })

    // Return the attachment with the download URL
    return {
      ...attachmentItem,
      url,
    }
  } catch (error) {
    console.error('Error creating attachment:', error)
    throw error
  }
}

/**
 * Get all attachments for a task
 * @param {string} taskId - The task ID
 * @returns {Array} Array of attachments with signed URLs
 */
export const getTaskAttachments = async (taskId) => {
  try {
    // Query DynamoDB for attachments
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `TASK#${taskId}`,
          ':sk': 'ATTACHMENT#',
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      return []
    }

    // Generate signed URLs for each attachment
    const attachmentsWithUrls = await Promise.all(
      result.Items.map(async (attachment) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: attachment.s3Key,
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return {
          ...attachment,
          url,
        }
      })
    )

    return attachmentsWithUrls
  } catch (error) {
    console.error('Error getting task attachments:', error)
    throw error
  }
}

/**
 * Delete an attachment
 * @param {string} taskId - The task ID
 * @param {string} attachmentId - The attachment ID
 * @returns {Object} Result of the deletion
 */
export const deleteAttachment = async (taskId, attachmentId) => {
  try {
    // First get the attachment to get the S3 key
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND sk = :sk',
        ExpressionAttributeValues: {
          ':pk': `TASK#${taskId}`,
          ':sk': `ATTACHMENT#${attachmentId}`,
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      throw new Error('Attachment not found')
    }

    const attachment = result.Items[0]

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: attachment.s3Key,
      })
    )

    // Delete from DynamoDB
    await dynamoDB.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: [
            {
              DeleteRequest: {
                Key: {
                  pk: `TASK#${taskId}`,
                  sk: `ATTACHMENT#${attachmentId}`,
                },
              },
            },
          ],
        },
      })
    )

    return { success: true, attachmentId, taskId }
  } catch (error) {
    console.error('Error deleting attachment:', error)
    throw error
  }
}
