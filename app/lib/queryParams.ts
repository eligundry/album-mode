interface UTMs {
  medium?: string
  campagin?: string
  term?: string
  content?: string
  go?: '1'
}

export const utmParams = (parameters: UTMs & Record<string, string>) => {
  const params = new URLSearchParams({
    utm_source: 'album-mode.party',
  })

  Object.entries(parameters).forEach(([key, value]) => {
    switch (key) {
      case 'medium':
      case 'campagin':
      case 'term':
      case 'content':
        params.set(`utm_${key}`, value)
        break
      default:
        params.set(key, value)
    }
  })

  return params
}

export const urlWithUTMParams = (
  strURL: string,
  parameters: UTMs & Record<string, string>
) => {
  const url = new URL(strURL)
  url.searchParams.set('utm_source', 'album-mode.party')

  Object.entries(parameters).forEach(([key, value]) => {
    switch (key) {
      case 'medium':
      case 'campagin':
      case 'term':
      case 'content':
        url.searchParams.set(`utm_${key}`, value)
        break
      default:
        url.searchParams.set(key, value)
    }
  })

  return url
}
