const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const fsp = fs.promises
const dataRoot = process.env.CARD_DATA_DIR || path.join(process.cwd(), 'data')
const cardsDir = path.join(dataRoot, 'cards')
const indexPath = path.join(cardsDir, 'index.json')

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex')
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

async function ensureStorage() {
  await fsp.mkdir(cardsDir, { recursive: true })

  try {
    await fsp.access(indexPath, fs.constants.F_OK)
  } catch (error) {
    await writeJson(indexPath, { cards: [] })
  }
}

async function readJson(filePath) {
  const raw = await fsp.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

async function writeJson(filePath, value) {
  const tempPath = `${filePath}.tmp`
  await fsp.writeFile(tempPath, JSON.stringify(value, null, 2))
  await fsp.rename(tempPath, filePath)
}

async function readIndex() {
  await ensureStorage()
  const value = await readJson(indexPath)
  if (!value.cards || !Array.isArray(value.cards)) {
    return { cards: [] }
  }
  return value
}

async function writeIndex(cards) {
  await writeJson(indexPath, { cards })
}

function buildSummary({ id, slug, ownerEmail, ownerName, createdAt, updatedAt, payload }) {
  const fname = payload.genInfo && payload.genInfo.fname ? payload.genInfo.fname : ''
  const lname = payload.genInfo && payload.genInfo.lname ? payload.genInfo.lname : ''
  const fullName = `${fname}${fname && lname ? ' ' : ''}${lname}`.trim()

  return {
    id,
    slug,
    ownerEmail,
    ownerName,
    createdAt,
    updatedAt,
    fullName: fullName || null,
    title: payload.genInfo && payload.genInfo.title ? payload.genInfo.title : null,
  }
}

async function writeCardDocument(card) {
  await ensureStorage()
  const filePath = path.join(cardsDir, `${card.id}.json`)
  await writeJson(filePath, card)
}

async function readCardDocument(id) {
  const filePath = path.join(cardsDir, `${id}.json`)
  return readJson(filePath)
}

async function deleteCardDocument(id) {
  const filePath = path.join(cardsDir, `${id}.json`)
  try {
    await fsp.unlink(filePath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

async function listCardsByOwner(ownerEmail) {
  const index = await readIndex()
  return index.cards
    .filter((card) => card.ownerEmail === ownerEmail)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function getCardById(id) {
  const index = await readIndex()
  const summary = index.cards.find((card) => card.id === id)
  if (!summary) {
    return null
  }
  const card = await readCardDocument(id)
  return {
    summary,
    card,
  }
}

async function getCardBySlug(slug) {
  const index = await readIndex()
  const summary = index.cards.find((card) => card.slug === slug)
  if (!summary) {
    return null
  }
  const card = await readCardDocument(summary.id)
  return {
    summary,
    card,
  }
}

async function saveCard({ id, ownerEmail, ownerName, payload }) {
  const index = await readIndex()
  const existing = id ? index.cards.find((card) => card.id === id) : null

  if (existing && existing.ownerEmail !== ownerEmail) {
    const error = new Error('Forbidden')
    error.statusCode = 403
    throw error
  }

  const createdAt = existing ? existing.createdAt : new Date().toISOString()
  const updatedAt = new Date().toISOString()
  const safeId = existing ? existing.id : randomHex(12)
  const safeSlug = existing ? existing.slug : randomHex(16)

  const summary = buildSummary({
    id: safeId,
    slug: safeSlug,
    ownerEmail,
    ownerName,
    createdAt,
    updatedAt,
    payload,
  })

  const card = {
    ...summary,
    data: clone(payload),
  }

  await writeCardDocument(card)

  const nextCards = existing
    ? index.cards.map((item) => (item.id === summary.id ? summary : item))
    : [...index.cards, summary]

  await writeIndex(nextCards)

  return {
    summary,
    card,
  }
}

async function deleteCard({ id, ownerEmail }) {
  const index = await readIndex()
  const existing = index.cards.find((card) => card.id === id)
  if (!existing) {
    return false
  }
  if (existing.ownerEmail !== ownerEmail) {
    const error = new Error('Forbidden')
    error.statusCode = 403
    throw error
  }

  const nextCards = index.cards.filter((card) => card.id !== id)
  await writeIndex(nextCards)
  await deleteCardDocument(id)
  return true
}

module.exports = {
  deleteCard,
  getCardById,
  getCardBySlug,
  listCardsByOwner,
  saveCard,
}
