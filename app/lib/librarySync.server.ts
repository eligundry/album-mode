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

const TableName = 'AlbumModeLibrary'

const getClient = () => {
  if (!process.env.APP_AWS_ACCESS_KEY_ID) {
    throw new Error('APP_AWS_ACCESS_KEY_ID env var must be set')
  }

  if (!process.env.APP_AWS_SECRET_ACCESS_KEY) {
    throw new Error('APP_AWS_SECRET_ACCESS_KEY env var must be set')
  }

  return new DynamoDBClient({
    region: 'us-east-2',
    credentials: {
      accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    },
  })
}

const saveItem = async (username: string, item: SavedLibraryItem) =>
  getClient().send(
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
  getClient().send(
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
  const client = getClient()
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
        return item.DeletedAt.S
          ? new Date(item.DeletedAt.S).toISOString()
          : null
      }).filter((ts): ts is string => !!ts) ?? [],
  }

  return library
}

const api = { saveItem, removeItem, getLibrary }

export default api
