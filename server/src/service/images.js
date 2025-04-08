import dynamoDB from '../config/dynamodb.js'
import s3Client from '../config/s3.js'
import {
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name'

// Get images from DynamoDB
export const getImages = async () => {
  try {
    const result = await dynamoDB.send(
      new QueryCommand({
        TableName: 'Images',
        KeyConditionExpression: 'type = :type',
        ExpressionAttributeValues: {
          ':type': 'image',
        },
      })
    )

    if (!result.Items || result.Items.length === 0) {
      throw new Error('No images found')
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

// Save images to DynamoDB
export const saveImages = async (images) => {
  try {
    // First, get all existing images to delete them
    const existingImages = await getImages()

    // Delete existing images from S3 and DynamoDB
    for (const image of existingImages) {
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
            Images: [
              {
                DeleteRequest: {
                  Key: {
                    type: 'image',
                    id: image.id,
                  },
                },
              },
            ],
          },
        })
      )
    }

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
          type: 'image',
          id: imageId,
          s3Key,
          description: image.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        await dynamoDB.send(
          new PutCommand({
            TableName: 'Images',
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
