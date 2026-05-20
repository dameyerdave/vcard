const { getUserFromHeaders } = require('./lib/auth')
const { deleteCard, getCardById, getCardBySlug, listCardsByOwner, saveCard } = require('./lib/cards')
const { getDraftByOwner, saveDraft } = require('./lib/drafts')
const { getBaseUrl, getRequestUrl, json, notFound, readJsonBody, text } = require('./lib/http')
const { buildVcardText } = require('./lib/vcard')

const BATCH_CARD_LIMIT = 200

function unauthorized(res) {
  json(res, 401, {
    error: 'Authentication required',
    detail:
      'No authenticated user email was found in the request headers. Protect the editor/API with Cloudflare Access. Local development can use APP_ENV=development with DEV_AUTH_EMAIL or the default test@test.com fallback.',
  })
}

function requireUser(req, res) {
  const user = getUserFromHeaders(req)
  if (!user) {
    unauthorized(res)
    return null
  }
  return user
}

function sanitizeGenInfo(genInfo) {
  return {
    ...(genInfo || {}),
    desc: null,
    key: null,
  }
}

function sanitizePayload(payload) {
  return {
    theme: payload.theme || 1,
    footerCredit: payload.footerCredit !== false,
    colors: payload.colors || {},
    genInfo: sanitizeGenInfo(payload.genInfo),
    images: payload.images || {},
    primaryActions: Array.isArray(payload.primaryActions) ? payload.primaryActions : [],
    secondaryActions: Array.isArray(payload.secondaryActions)
      ? payload.secondaryActions
      : [],
    featured: Array.isArray(payload.featured) ? payload.featured : [],
  }
}

function sanitizeDraftPayload(payload) {
  return {
    ...sanitizePayload(payload),
    currentCardId: payload.currentCardId || null,
    currentCardSlug: payload.currentCardSlug || null,
    hostedURL: payload.hostedURL || null,
    downloadCheckList: Array.isArray(payload.downloadCheckList)
      ? payload.downloadCheckList.map((item) => ({
          label: item && item.label ? item.label : '',
          checked: Boolean(item && item.checked),
        }))
      : [],
  }
}

function publicCardResponse(req, card) {
  return {
    id: card.id,
    slug: card.slug,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    fullName: card.fullName,
    title: card.title,
    url: `${getBaseUrl(req)}/vcard/${card.slug}`,
    data: card.data,
  }
}

module.exports = async function api(req, res, next) {
  if (!req.url.startsWith('/api/')) {
    next()
    return
  }

  try {
    const requestUrl = getRequestUrl(req)
    const { pathname } = requestUrl

    if (req.method === 'GET' && pathname === '/api/me') {
      const user = getUserFromHeaders(req)
      json(res, 200, { user })
      return
    }

    if (req.method === 'GET' && pathname === '/api/cards') {
      const user = requireUser(req, res)
      if (!user) {
        return
      }

      const cards = await listCardsByOwner(user.email)
      json(res, 200, {
        user,
        cards: cards.map((card) => ({
          ...card,
          url: `${getBaseUrl(req)}/vcard/${card.slug}`,
        })),
      })
      return
    }

    if (pathname === '/api/draft') {
      const user = requireUser(req, res)
      if (!user) {
        return
      }

      if (req.method === 'GET') {
        const draft = await getDraftByOwner(user.email)
        json(res, 200, { draft })
        return
      }

      if (req.method === 'PUT') {
        const body = await readJsonBody(req)
        const payload = sanitizeDraftPayload(body.draft || {})
        const draft = await saveDraft({
          ownerEmail: user.email,
          ownerName: user.name,
          payload,
        })
        json(res, 200, { draft })
        return
      }
    }

    if (req.method === 'POST' && pathname === '/api/cards') {
      const user = requireUser(req, res)
      if (!user) {
        return
      }

      const body = await readJsonBody(req)
      const payload = sanitizePayload(body.card || {})
      const saved = await saveCard({
        id: body.id || null,
        ownerEmail: user.email,
        ownerName: user.name,
        payload,
      })

      json(res, 200, {
        card: {
          ...saved.summary,
          url: `${getBaseUrl(req)}/vcard/${saved.summary.slug}`,
        },
      })
      return
    }

    if (req.method === 'POST' && pathname === '/api/cards/batch') {
      const user = requireUser(req, res)
      if (!user) {
        return
      }

      const body = await readJsonBody(req)
      const cards = Array.isArray(body.cards) ? body.cards : []

      if (!cards.length) {
        const error = new Error('No cards were provided for batch creation.')
        error.statusCode = 400
        throw error
      }

      if (cards.length > BATCH_CARD_LIMIT) {
        const error = new Error(
          `Batch creation is limited to ${BATCH_CARD_LIMIT} cards per request.`
        )
        error.statusCode = 400
        throw error
      }

      const savedCards = []
      for (const card of cards) {
        const payload = sanitizePayload(card || {})
        const saved = await saveCard({
          id: null,
          ownerEmail: user.email,
          ownerName: user.name,
          payload,
        })

        savedCards.push({
          ...saved.summary,
          url: `${getBaseUrl(req)}/vcard/${saved.summary.slug}`,
        })
      }

      json(res, 200, { cards: savedCards })
      return
    }

    if (pathname.startsWith('/api/cards/')) {
      const user = requireUser(req, res)
      if (!user) {
        return
      }

      const id = pathname.replace('/api/cards/', '')
      const record = await getCardById(id)

      if (!record) {
        notFound(res)
        return
      }

      if (record.summary.ownerEmail !== user.email) {
        json(res, 403, { error: 'Forbidden' })
        return
      }

      if (req.method === 'GET') {
        json(res, 200, {
          card: publicCardResponse(req, record.card),
        })
        return
      }

      if (req.method === 'DELETE') {
        await deleteCard({ id, ownerEmail: user.email })
        json(res, 200, { deleted: true })
        return
      }
    }

    if (pathname.startsWith('/api/public/cards/')) {
      const suffix = pathname.replace('/api/public/cards/', '')
      const [slug, extra] = suffix.split('/')
      const record = await getCardBySlug(slug)

      if (!record) {
        notFound(res)
        return
      }

      if (req.method === 'GET' && !extra) {
        json(res, 200, {
          card: publicCardResponse(req, record.card),
        })
        return
      }

      if (req.method === 'GET' && extra === 'vcard') {
        const hostedUrl = `${getBaseUrl(req)}/vcard/${record.card.slug}`
        const filename = `${(record.card.fullName || 'digital-business-card').replace(/[^\w.-]+/g, '-')}.vcf`
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        text(res, 200, buildVcardText(record.card.data, hostedUrl), 'text/vcard; charset=utf-8')
        return
      }
    }

    notFound(res)
  } catch (error) {
    const statusCode = error.statusCode || 500
    json(res, statusCode, {
      error: error.message || 'Internal server error',
    })
  }
}
