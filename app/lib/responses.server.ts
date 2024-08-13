import { HeadersFunction, json } from '@remix-run/node'
import { isbot } from 'isbot'
import omit from 'lodash/omit'
import type { Logger } from 'winston'
import type { ZodIssue } from 'zod'

type ErrorMessage = {
  error: string
  detail?: string
  issues?: ZodIssue[]
  logger?: Logger
  headers?: HeadersInit
}

export function badRequest({ logger, headers, ...message }: ErrorMessage) {
  logger?.warn({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 400,
    headers,
  })
}

export function serverError({ logger, headers, ...message }: ErrorMessage) {
  logger?.error({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 500,
    headers,
  })
}

export function unauthorized({ logger, headers, ...message }: ErrorMessage) {
  logger?.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 401,
    headers,
  })
}

export function forbidden({ logger, headers, ...message }: ErrorMessage) {
  logger?.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 403,
    headers,
  })
}

export function notFound({ logger, headers, ...message }: ErrorMessage) {
  logger?.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 404,
    headers,
  })
}

export function unprocessableEntity({
  logger,
  headers,
  ...message
}: ErrorMessage) {
  logger?.warn({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw json(message, {
    status: 429,
    headers,
  })
}

export function noContent(responseInit: Pick<ResponseInit, 'headers'> = {}) {
  return new Response(null, {
    status: 204,
    ...responseInit,
  })
}

export const forwardServerTimingHeaders: HeadersFunction = ({
  loaderHeaders,
}) => {
  const serverTiming = loaderHeaders.get('Server-Timing')

  if (serverTiming) {
    return {
      'server-timing': serverTiming,
    }
  }

  return new Headers()
}

export function blockBots(request: Request) {
  const userAgent = request.headers.get('user-agent')

  if (!userAgent) {
    throw badRequest({
      error: 'User-Agent header is missing',
    })
  }

  if (isbot(userAgent)) {
    throw forbidden({
      error: 'Bots are not allowed to access this resource.',
    })
  }
}
