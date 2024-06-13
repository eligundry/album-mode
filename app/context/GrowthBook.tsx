// Growthbook is broken until this issue is resolved
// https://github.com/growthbook/growthbook/issues/2237
//
// import {
//   GrowthBookProvider as ActualGrowthBookProvider,
//   GrowthBook,
//   Context as GrowthBookContext,
// } from '@growthbook/growthbook-react'
// import { useMemo } from 'react'
//
// import useGTM from '~/hooks/useGTM'
//
// const GrowthBookProvider: React.FC<
//   React.PropsWithChildren<{
//     attributes: Record<string, any>
//     features: Record<string, any>
//   }>
// > = ({ children, attributes, features }) => {
//   const sendEvent = useGTM()
//   const growthbook = useMemo(() => {
//     let config: GrowthBookContext = {
//       features: {},
//       trackingCallback: (experiment, result) => {
//         console.debug('experiment_viewed', { experiment, result })
//
//         sendEvent({
//           event: 'experiment_viewed',
//           event_category: 'experiment',
//           experiment_id: experiment.key,
//           variation_id: result.key,
//         })
//       },
//       onFeatureUsage: (key, result) => {
//         if (!result.experiment) {
//           console.debug('feature_used', { key, result })
//         }
//       },
//     }
//
//     if (typeof window !== 'undefined') {
//       config = {
//         ...config,
//         apiHost: window.ENV.GROWTHBOOK_API_HOST,
//         clientKey: window.ENV.GROWTHBOOK_CLIENT_KEY,
//         features,
//         attributes,
//       }
//     }
//
//     return new GrowthBook(config)
//   }, [sendEvent, features, attributes])
//
//   return (
//     <ActualGrowthBookProvider growthbook={growthbook}>
//       {children}
//     </ActualGrowthBookProvider>
//   )
// }

const GrowthBookProvider: React.FC<
  React.PropsWithChildren<{
    attributes: Record<string, any>
    features: Record<string, any>
  }>
> = ({ children }) => {
  return children
}

export default GrowthBookProvider
