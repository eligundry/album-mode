/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export default {
  serverBuildTarget: 'netlify',
  server: './server.js',
  ignoredRouteFiles: ['.*'],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: ".netlify/functions-internal/server.js",
  // publicPath: "/build/",
}
