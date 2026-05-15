function fallbackName(email) {
  if (!email) {
    return null
  }
  return email.split('@')[0]
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
    process.env.DEV_AUTH_EMAIL ||
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
