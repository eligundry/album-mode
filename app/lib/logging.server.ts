import emailjs from '@emailjs/nodejs'
import winston from 'winston'
import Transport, { TransportStreamOptions } from 'winston-transport'

import { getEnv } from '~/env.server'

interface EmailJsTransportOptions extends TransportStreamOptions {
  logger: winston.Logger
  publicKey: string
  privateKey: string
  templateID: string
  serviceID: string
  filter?: (info: any) => boolean
}

class EmailJsTransport extends Transport implements Transport {
  publicKey: string
  privateKey: string
  templateID: string
  serviceID: string
  filter: EmailJsTransportOptions['filter']
  logger: winston.Logger

  constructor({
    logger,
    publicKey,
    privateKey,
    templateID,
    serviceID,
    filter,
    ...transportOptions
  }: EmailJsTransportOptions) {
    super(transportOptions)
    this.publicKey = publicKey
    this.privateKey = privateKey
    this.templateID = templateID
    this.serviceID = serviceID
    this.filter = filter
    this.logger = logger
  }

  public async log(info: any, next: () => void) {
    setImmediate(() => this.emit('logged', info))

    if (this.filter && !this.filter(info)) {
      return next()
    }

    try {
      const response = await emailjs.send(
        this.serviceID,
        this.templateID,
        {
          logMessage: JSON.stringify(info, undefined, 2),
        },
        {
          publicKey: this.publicKey,
          privateKey: this.privateKey,
        }
      )

      this.logger.debug({
        message: 'sent log message to emailjs',
        response,
      })
    } catch (error) {
      this.logger.warn({
        message: 'could not send message through emailjs to notify of error',
        error,
      })
    }

    next()
  }
}

export const constructLogger = () => {
  const env = getEnv()

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

  if (env.LOGGER_EMAIL_SETTINGS) {
    logger.add(
      new EmailJsTransport({
        ...env.LOGGER_EMAIL_SETTINGS,
        level: 'error',
        filter: (info) => !!info.email,
        logger,
      })
    )
  }

  return logger
}
