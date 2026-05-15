const { queryJson, run, sqlValue } = require('./database')

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(clone(payload)), 'utf8').toString('base64')
}

function decodePayload(payloadBase64) {
  return JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'))
}

async function getDraftByOwner(ownerEmail) {
  const rows = await queryJson(`
    SELECT
      email AS ownerEmail,
      owner_name AS ownerName,
      payload_base64 AS payloadBase64,
      updated_at AS updatedAt
    FROM drafts
    WHERE email = ${sqlValue(ownerEmail)}
    LIMIT 1;
  `)

  if (!rows.length) {
    return null
  }

  return {
    ownerEmail: rows[0].ownerEmail,
    ownerName: rows[0].ownerName,
    updatedAt: rows[0].updatedAt,
    payload: decodePayload(rows[0].payloadBase64),
  }
}

async function saveDraft({ ownerEmail, ownerName, payload }) {
  const updatedAt = new Date().toISOString()
  const payloadBase64 = encodePayload(payload)

  await run(`
    INSERT INTO drafts (email, owner_name, payload_base64, updated_at)
    VALUES (
      ${sqlValue(ownerEmail)},
      ${sqlValue(ownerName)},
      ${sqlValue(payloadBase64)},
      ${sqlValue(updatedAt)}
    )
    ON CONFLICT(email) DO UPDATE SET
      owner_name = excluded.owner_name,
      payload_base64 = excluded.payload_base64,
      updated_at = excluded.updated_at;
  `)

  return {
    ownerEmail,
    ownerName,
    updatedAt,
    payload: clone(payload),
  }
}

module.exports = {
  getDraftByOwner,
  saveDraft,
}
