const paths = ['', 'about', 'help', 'labs', 'genres', 'labels']

const content = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${paths
    .map(
      (p) => `
    <url>
      <loc>https://album-mode.party/${p}</loc>
      <priority>0.7</priority>
    </url>
    `
    )
    .join('\n')}
</urlset>
`

export function loader() {
  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8',
    },
  })
}
