/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverBuildTarget: 'netlify',
  server: './server.mjs',
  ignoredRouteFiles: ['.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: ".netlify/functions-internal/server.js",
  // publicPath: "/build/",
}
