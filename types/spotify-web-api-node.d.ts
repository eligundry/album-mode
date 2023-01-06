declare module 'spotify-web-api-node/src/response-error' {
  export class WebapiError extends Error {
    body: Record<string, unknown>
    headers: Record<string, string>
    statusCode: number
  }
}
