import emailjs from '@emailjs/nodejs'
import winston from 'winston'
import Transport, { TransportStreamOptions } from 'winston-transport'

interface EmailJsTransportOptions extends TransportStreamOptions {
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

  constructor({
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

      logger.debug({
        message: 'sent log message to emailjs',
        response,
      })
    } catch (error) {
      logger.warn({
        message: 'could not send message through emailjs to notify of error',
        error,
      })
    }

    next()
  }
}

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
})

if (process.env.LOGGER_EMAIL_SETTINGS) {
  const settings = JSON.parse(process.env.LOGGER_EMAIL_SETTINGS) as Pick<
    EmailJsTransportOptions,
    'publicKey' | 'privateKey' | 'templateID' | 'serviceID'
  >

  logger.add(
    new EmailJsTransport({
      ...settings,
      level: 'error',
      filter: (info) => !!info.email,
    })
  )
}

export default logger
