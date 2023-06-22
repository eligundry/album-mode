/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ['**/.*'],
  server: process.env.NODE_ENV === 'development' ? undefined : './server.ts',
  serverBuildPath: 'api/index.js',
  // serverDependenciesToBundle: ['@eligundry/server-timing'],
  tailwind: true,
  postcss: true,
  future: {
    v2_errorBoundary: true,
  },
}
