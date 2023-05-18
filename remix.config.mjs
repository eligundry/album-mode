/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverBuildTarget: 'netlify',
  server: './server.mjs',
  ignoredRouteFiles: ['.*'],
  serverDependenciesToBundle: ['@eligundry/server-timing'],
  tailwind: true,
  future: {
    v2_errorBoundary: true,
  },
}
