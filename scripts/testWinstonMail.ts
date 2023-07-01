import { constructLogger } from '~/lib/logging.server'

const mail = async () => {
  const logger = constructLogger()
  logger.error({
    message: 'We are getting rate limited!',
    foo: 'bar',
    email: true,
  })
}

mail()
