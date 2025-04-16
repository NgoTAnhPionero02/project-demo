import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
})

const dynamoDB = DynamoDBDocumentClient.from(client)

export default dynamoDB
