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
      FilterExpression: 'attribute_not_exists(DeletedAt)',
      ExpressionAttributeValues: {
        ':username': {
          S: username,
        },
      },
    })
  )
  const removedItems = await client.send(
    new QueryCommand({
      TableName,
      KeyConditionExpression: 'Username = :username',
      FilterExpression: 'attribute_exists(DeletedAt)',
      ExpressionAttributeValues: {
        ':username': {
          S: username,
        },
      },
    })
  )

  const library: CurrentLibrary = {
    ...defaultLibrary,
    items:
      items.Items?.map((item) => JSON.parse(item.Record.S ?? 'null')).filter(
        (item) => !!item
      ) ?? [],
    removedItemTimestamps:
      removedItems.Items?.map((item) => {
        console.log(item.DeletedAt)
        return item.DeletedAt.S
          ? new Date(item.DeletedAt.S).toISOString()
          : null
      }).filter((ts): ts is string => !!ts) ?? [],
  }

  return library
}

const api = { saveItem, removeItem, getLibrary }

export default api
