/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverBuildTarget: 'netlify',
  server: './server.mjs',
  ignoredRouteFiles: ['.*'],
  serverDependenciesToBundle: ['@eligundry/server-timing', 'better-sqlite3'],
  tailwind: true,
}
