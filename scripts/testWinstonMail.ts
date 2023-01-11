import logger from '~/lib/logging.server'

const mail = async () => {
  logger.error({
    message: 'We are getting rate limited',
    foo: 'bar',
    email: true,
  })
}

mail()
