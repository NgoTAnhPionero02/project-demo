import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb'
import { TABLE_SCHEMA } from '../config/tables.js'

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
})

export default async function createTable() {
  try {
    // First check if table exists
    const describeParams = {
      TableName: TABLE_SCHEMA.TableName,
    }

    try {
      await client.send(new DescribeTableCommand(describeParams))
      console.log('Table already exists:', TABLE_SCHEMA.TableName)

      // Check if GSIs exist
      const describeResult = await client.send(
        new DescribeTableCommand(describeParams)
      )
      const existingGSIs = describeResult.Table?.GlobalSecondaryIndexes || []

      // Check if all required GSIs exist
      const requiredGSIs = TABLE_SCHEMA.GlobalSecondaryIndexes
      const missingGSIs = requiredGSIs.filter(
        (gsi) => !existingGSIs.some((existing) => existing.IndexName === gsi.IndexName)
      )

      if (missingGSIs.length > 0) {
        console.log(
          'Creating missing GSIs:',
          missingGSIs.map((gsi) => gsi.IndexName)
        )

        // Update table to add missing GSIs
        const updateParams = {
          TableName: TABLE_SCHEMA.TableName,
          AttributeDefinitions: TABLE_SCHEMA.AttributeDefinitions,
          GlobalSecondaryIndexUpdates: missingGSIs.map((gsi) => ({
            Create: {
              IndexName: gsi.IndexName,
              KeySchema: gsi.KeySchema,
              Projection: gsi.Projection,
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          })),
        }

        await client.send(new UpdateTableCommand(updateParams))
        console.log('GSIs created successfully')
      } else {
        console.log('All GSIs already exist')
      }
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.log('Table does not exist, creating...')

        // Create table with all GSIs
        const createParams = {
          TableName: TABLE_SCHEMA.TableName,
          KeySchema: TABLE_SCHEMA.KeySchema,
          AttributeDefinitions: TABLE_SCHEMA.AttributeDefinitions,
          GlobalSecondaryIndexes: TABLE_SCHEMA.GlobalSecondaryIndexes.map(
            (gsi) => ({
              ...gsi,
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            })
          ),
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        }

        await client.send(new CreateTableCommand(createParams))
        console.log('Table created successfully')
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error creating table:', error)
    throw error
  }
}

// Execute the createTable function when script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error)
      process.exit(1)
    })
}
