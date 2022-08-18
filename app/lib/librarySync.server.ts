import {
  DynamoDBClient,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'

import { SavedLibraryItem } from '~/lib/types/library'

const client = new DynamoDBClient({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
})
const TableName = 'AlbumModeLibrary'

const saveItem = async (username: string, item: SavedLibraryItem) =>
  client.send(
    new PutItemCommand({
      TableName,
      Item: {
        Username: {
          S: username,
        },
        SavedAt: {
          S:
            typeof item.savedAt === 'string'
              ? item.savedAt
              : item.savedAt.toISOString(),
        },
        Record: {
          S: JSON.stringify(item),
        },
      },
    })
  )

const removeItem = async (username: string, savedAt: string) =>
  client.send(
    new DeleteItemCommand({
      TableName,
      Key: {
        Username: {
          S: username,
        },
        SavedAt: {
          S: savedAt,
        },
      },
    })
  )

const getLibrary = async (username: string) => {
  const items = await client.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: 'Username = :username',
      ExpressionAttributeValues: {
        ':username': {
          S: username,
        },
      },
    })
  )

  const library = items.Items?.map((item) => JSON.parse(item.Record.S))

  return library
}

const api = { saveItem, removeItem, getLibrary }

export default api
