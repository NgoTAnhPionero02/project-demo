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

// Get images from DynamoDB
export const getImages = async () => {
  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UserBoardIndex',
        KeyConditionExpression: 'sk = :sk',
        ExpressionAttributeValues: {
          ':sk': 'IMAGE#METADATA',
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      return []
    }

    // Get signed URLs for each image
    const imagesWithUrls = await Promise.all(
      result.Items.map(async (image) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: image.s3Key,
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return {
          ...image,
          url,
        }
      })
    )

    return imagesWithUrls
  } catch (error) {
    console.error('Error getting images:', error)
    throw error
  }
}

// Get board cover images
export const getBoardCoverImages = async () => {
  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UserBoardIndex',
        KeyConditionExpression: 'sk = :sk',
        FilterExpression: 'imageType = :imageType',
        ExpressionAttributeValues: {
          ':sk': 'IMAGE#METADATA',
          ':imageType': 'cover',
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      return []
    }

    // Get signed URLs for each image
    const imagesWithUrls = await Promise.all(
      result.Items.map(async (image) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: image.s3Key,
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return {
          ...image,
          url,
        }
      })
    )

    return imagesWithUrls
  } catch (error) {
    console.error('Error getting board cover images:', error)
    throw error
  }
}

// Save images to DynamoDB
export const saveImages = async (images, imageType = 'general') => {
  try {
    // Save new images
    const savedImages = await Promise.all(
      images.map(async (image) => {
        const imageId = `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`
        const s3Key = `images/${imageId}.${image.type.split('/')[1]}`

        // Upload to S3
        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: Buffer.from(image.data, 'base64'),
            ContentType: image.type,
          })
        )

        // Save metadata to DynamoDB
        const metadata = {
          pk: `IMAGE#${imageId}`,
          sk: 'IMAGE#METADATA',
          id: imageId,
          s3Key,
          description: image.description || '',
          imageType,
          entityType: ENTITY_TYPES.IMAGE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await dynamoDB.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: metadata,
          })
        )

        // Get signed URL
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        })
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        return {
          ...metadata,
          url,
        }
      })
    )

    return savedImages
  } catch (error) {
    console.error('Error saving images:', error)
    throw error
  }
}

// Delete image
export const deleteImage = async (imageId) => {
  try {
    // First get the image to get the S3 key
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND sk = :sk',
        ExpressionAttributeValues: {
          ':pk': `IMAGE#${imageId}`,
          ':sk': 'IMAGE#METADATA',
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      throw new Error('Image not found')
    }

    const image = result.Items[0]

    // Delete from S3
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: image.s3Key,
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
                  pk: `IMAGE#${imageId}`,
                  sk: 'IMAGE#METADATA',
                },
              },
            },
          ],
        },
      })
    )

    return { success: true, imageId }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}
