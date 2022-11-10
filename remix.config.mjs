/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverBuildTarget: 'netlify',
  server: './server.mjs',
  ignoredRouteFiles: ['.*'],
  serverDependenciesToBundle: ['@eligundry/server-timing'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: ".netlify/functions-internal/server.js",
  // publicPath: "/build/",
}
