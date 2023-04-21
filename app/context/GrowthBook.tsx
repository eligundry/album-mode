import {
  GrowthBookProvider as ActualGrowthBookProvider,
  GrowthBook,
  Context as GrowthBookContext,
  GrowthBookSSRData,
  useGrowthBookSSR,
} from '@growthbook/growthbook-react'
import * as Sentry from '@sentry/browser'
import { useMemo } from 'react'

import useGTM from '~/hooks/useGTM'

const GrowthBookProvider: React.FC<
  React.PropsWithChildren<GrowthBookSSRData>
> = ({ children, attributes, features }) => {
  const sendEvent = useGTM()
  const growthbook = useMemo(() => {
    let config: GrowthBookContext = {
      features: {},
      trackingCallback: (experiment, result) => {
        console.debug('experiment_viewed', { experiment, result })

        sendEvent({
          event: 'experiment_viewed',
          event_category: 'experiment',
          experiment_id: experiment.key,
          variation_id: result.key,
        })

        Sentry.setTag(`growthbook:${experiment.key}`, result.key)
      },
      onFeatureUsage: (key, result) => {
        if (!result.experiment) {
          console.debug('feature_used', { key, result })
          Sentry.setTag(`growthbook:${key}`, result.value)
        }
      },
    }

    if (typeof window !== 'undefined') {
      config = {
        ...config,
        apiHost: window.ENV.GROWTHBOOK_API_HOST,
        clientKey: window.ENV.GROWTHBOOK_CLIENT_KEY,
      }
    }

    return new GrowthBook(config)
  }, [sendEvent])

  return (
    <ActualGrowthBookProvider growthbook={growthbook}>
      <InternalAttributeProvider attributes={attributes} features={features}>
        {children}
      </InternalAttributeProvider>
    </ActualGrowthBookProvider>
  )
}

const InternalAttributeProvider: React.FC<
  React.PropsWithChildren<GrowthBookSSRData>
> = ({ children, ...growthbookData }) => {
  useGrowthBookSSR(growthbookData)
  return <>{children}</>
}

export default GrowthBookProvider
