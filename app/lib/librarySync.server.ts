import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'

import {
  SavedLibraryItem,
  CurrentLibrary,
  defaultLibrary,
} from '~/lib/types/library'

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
    new UpdateItemCommand({
      TableName,
      Key: {
        Username: {
          S: username,
        },
        SavedAt: {
          S: savedAt,
        },
      },
      UpdateExpression: 'SET DeletedAt = :deletedAt',
      ExpressionAttributeValues: {
        ':deletedAt': {
          S: new Date().toString(),
        },
      },
    })
  )

const getLibrary = async (username: string): Promise<CurrentLibrary> => {
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

  const library = { ...defaultLibrary }

  items.Items?.forEach((record) => {
    const item: SavedLibraryItem = JSON.parse(record.Record.S)

    if (record.DeletedAt) {
      library.removedItemTimestamps.push(
        typeof item.savedAt === 'string'
          ? item.savedAt
          : item.savedAt.toISOString()
      )
    } else {
      library.items.push(item)
    }
  })

  return library
}

const api = { saveItem, removeItem, getLibrary }

export default api
