import { HeadersFunction, ResponseInit } from '@remix-run/node'
import omit from 'lodash/omit'
import {
  badRequest as _badRequest,
  forbidden as _forbidden,
  notFound as _notFound,
  serverError as _serverError,
  unauthorized as _unauthorized,
  unprocessableEntity as _unprocessableEntity,
} from 'remix-utils'
import type { ZodIssue } from 'zod'

import globalLogger from '~/lib/logging.server'

type ErrorMessage = {
  error: string
  detail?: string
  issues?: ZodIssue[]
  logger?: typeof globalLogger
  headers?: HeadersInit
}

export function badRequest({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.warn({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _badRequest(message, { headers })
}

export function serverError({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.error({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _serverError(message, { headers })
}

export function unauthorized({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _unauthorized(message, { headers })
}

export function forbidden({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _forbidden(message, { headers })
}

export function notFound({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.info({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _notFound(message, { headers })
}

export function unprocessableEntity({
  logger = globalLogger,
  headers,
  ...message
}: ErrorMessage) {
  logger.warn({
    message: message.error,
    ...omit(message, ['error']),
  })

  throw _unprocessableEntity(message, { headers })
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
