const { URL } = require('url')

function json(res, statusCode, payload) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function text(res, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  res.statusCode = statusCode
  res.setHeader('Content-Type', contentType)
  res.end(payload)
}

function notFound(res) {
  json(res, 404, { error: 'Not found' })
}

function getRequestUrl(req) {
  const host = req.headers.host || 'localhost'
  return new URL(req.url, `http://${host}`)
}

function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/+$/, '')
  }

  const forwardedProto = req.headers['x-forwarded-proto']
  const cfVisitor = req.headers['cf-visitor']
  const proto =
    forwardedProto ||
    (typeof cfVisitor === 'string' && cfVisitor.includes('"https"')
      ? 'https'
      : 'http')
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  return `${proto}://${host}`
}

function readJsonBody(
  req,
  maxBytes = Number(process.env.MAX_JSON_BODY_BYTES || 100 * 1024 * 1024)
) {
  return new Promise((resolve, reject) => {
    let size = 0
    let raw = ''

    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) {
        const error = new Error('Payload too large')
        error.statusCode = 413
        reject(error)
        req.destroy()
        return
      }
      raw += chunk.toString('utf8')
    })

    req.on('end', () => {
      if (!raw) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        error.statusCode = 400
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

module.exports = {
  getBaseUrl,
  getRequestUrl,
  json,
  notFound,
  readJsonBody,
  text,
}
