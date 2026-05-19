function fallbackName(email) {
  if (!email) {
    return null
  }
  return email.split('@')[0]
}

function isDevelopmentMode() {
  const appEnv = (process.env.APP_ENV || process.env.NODE_ENV || '').toLowerCase()
  return appEnv === 'development' || appEnv === 'dev'
}

function getDevelopmentEmail() {
  if (!isDevelopmentMode()) {
    return null
  }

  return process.env.DEV_AUTH_EMAIL || 'test@test.com'
}

function getUserFromHeaders(req) {
  const headers = req.headers || {}
  const emailHeaderName =
    (process.env.CLOUDFLARE_ACCESS_EMAIL_HEADER || '').toLowerCase() ||
    'cf-access-authenticated-user-email'
  const nameHeaderName = (
    process.env.CLOUDFLARE_ACCESS_NAME_HEADER || 'cf-access-authenticated-user-name'
  ).toLowerCase()

  const email =
    headers[emailHeaderName] ||
    headers['x-auth-request-email'] ||
    headers['x-forwarded-email'] ||
    getDevelopmentEmail() ||
    null

  if (!email) {
    return null
  }

  const name = headers[nameHeaderName] || fallbackName(email)

  return {
    email,
    name,
  }
}

module.exports = {
  getUserFromHeaders,
}
