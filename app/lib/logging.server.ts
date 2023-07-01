import { Resend } from 'resend'
import winston from 'winston'
import Transport, { TransportStreamOptions } from 'winston-transport'

import ErrorEmailTemplate from '~/components/ErrorEmail'
import { Env, getEnv } from '~/env.server'

interface ResendTransportOptions extends TransportStreamOptions {
  logger: winston.Logger
  filter?: (info: any) => boolean
  resendKey: string
}

class ResendTransport extends Transport implements Transport {
  filter: ResendTransportOptions['filter']
  logger: winston.Logger
  resend: Resend

  constructor({ logger, filter, ...transportOptions }: ResendTransportOptions) {
    super(transportOptions)
    this.filter = filter
    this.logger = logger
    this.resend = new Resend()
  }

  public async log(info: any, next: () => void) {
    setImmediate(() => this.emit('logged', info))

    if (this.filter && !this.filter(info)) {
      return next()
    }

    try {
      const response = await this.resend.emails.send({
        from: 'Album-mode.party <app@album-mode.party>',
        to: 'Eli Gundry <eligundry@gmail.com>',
        subject: 'Error on Album-Mode.party',
        // @ts-ignore
        react: ErrorEmailTemplate({ info }),
      })

      this.logger.debug({
        message: 'sent log message to resend',
        response,
      })
    } catch (error: any) {
      console.log(error)
      this.logger.warn({
        message: 'could not send message through resend to notify of error',
        error: error?.message,
      })
    }

    next()
  }
}

export const constructLogger = (env?: Env) => {
  if (!env) {
    env = getEnv()
  }

  const logger = winston.createLogger({
    level: 'info',
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json({
        space: env.SEED_SCRIPT || env.NODE_ENV !== 'production' ? 4 : undefined,
      })
    ),
  })

  if (env.RESEND_API_KEY) {
    logger.add(
      new ResendTransport({
        level: 'error',
        filter: (info) => !!info.email,
        logger,
        resendKey: env.RESEND_API_KEY,
      })
    )
  }

  return logger
}
