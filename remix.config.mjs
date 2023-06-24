/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  ignoredRouteFiles: ['**/.*'],
  server:
    process.env.NETLIFY || process.env.NETLIFY_LOCAL
      ? './server.ts'
      : undefined,
  serverBuildPath: '.netlify/functions-internal/server.js',
  serverDependenciesToBundle: ['@eligundry/server-timing'],
  serverModuleFormat: 'cjs',
  tailwind: true,
  postcss: true,
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
  },
}
