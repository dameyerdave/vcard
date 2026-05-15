const fs = require('fs')
const path = require('path')

const { getCardBySlug } = require('./lib/cards')
const { text, getBaseUrl, getRequestUrl } = require('./lib/http')
const { buildVcardText } = require('./lib/vcard')
const { renderPublicCardPage } = require('./lib/public-card-page')

const appleTouchIcon = fs.readFileSync(path.join(process.cwd(), 'static', 'apple-touch-icon.png'))
const icon192 = fs.readFileSync(path.join(process.cwd(), 'static', 'icon_192.png'))
const icon512 = fs.readFileSync(path.join(process.cwd(), 'static', 'icon_512.png'))

function binary(res, statusCode, payload, contentType, headers = {}) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Length', String(payload.length))
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  res.end(payload)
}

function notFoundHtml(res) {
  text(
    res,
    404,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Card unavailable</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem;box-sizing:border-box;background:#1f2937;color:#e5e7eb;font-family:sans-serif;text-align:center}h1{margin:0 0 1rem;font-size:2rem}p{margin:0;color:#cbd5e1}</style></head><body><div><h1>Card unavailable</h1><p>The requested business card could not be found.</p></div></body></html>`,
    'text/html; charset=utf-8'
  )
}

module.exports = async function publicCard(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next()
    return
  }

  const { pathname } = getRequestUrl(req)
  const match = pathname.match(/^\/vcard\/([^/]+)(?:\/([^/]+))?\/?$/)

  if (!match) {
    next()
    return
  }

  try {
    const slug = decodeURIComponent(match[1])
    const extra = match[2] || ''
    const record = await getCardBySlug(slug)

    if (!record) {
      notFoundHtml(res)
      return
    }

    const cardPath = `/vcard/${record.card.slug}`
    const hostedUrl = `${getBaseUrl(req)}/vcard/${record.card.slug}`

    if (!extra) {
      const html = renderPublicCardPage({
        card: record.card,
        hostedUrl,
        vcardPath: `${cardPath}/contact.vcf`,
        manifestPath: `${cardPath}/manifest.webmanifest`,
        appleTouchIconPath: `${cardPath}/apple-touch-icon.png`,
        icon192Path: `${cardPath}/icon-192.png`,
      })
      text(res, 200, html, 'text/html; charset=utf-8')
      return
    }

    if (extra === 'contact.vcf') {
      const filename = `${(record.card.fullName || 'digital-business-card').replace(
        /[^\w.-]+/g,
        '-'
      )}.vcf`
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      text(
        res,
        200,
        buildVcardText(record.card.data, hostedUrl),
        'text/vcard; charset=utf-8'
      )
      return
    }

    if (extra === 'apple-touch-icon.png') {
      binary(res, 200, appleTouchIcon, 'image/png')
      return
    }

    if (extra === 'icon-192.png') {
      binary(res, 200, icon192, 'image/png')
      return
    }

    if (extra === 'icon-512.png') {
      binary(res, 200, icon512, 'image/png')
      return
    }

    if (extra === 'manifest.webmanifest') {
      text(
        res,
        200,
        JSON.stringify({
          id: cardPath,
          name: `${record.card.fullName || 'Digital Business Card'} - xuno vcard generator`,
          short_name: record.card.fullName || 'vCard',
          start_url: cardPath,
          scope: cardPath,
          display: 'standalone',
          background_color: '#1f2937',
          theme_color: '#111827',
          icons: [
            {
              src: `${cardPath}/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `${cardPath}/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        }),
        'application/manifest+json; charset=utf-8'
      )
      return
    }

    notFoundHtml(res)
  } catch (error) {
    text(
      res,
      500,
      '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><title>Card unavailable</title></head><body>Unable to load the requested business card.</body></html>',
      'text/html; charset=utf-8'
    )
  }
}
