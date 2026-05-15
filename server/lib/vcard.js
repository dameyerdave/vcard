const { buildVcardAddressValue, normalizeGenInfoAddress } = require('../../utils/address')

function getActionUrl(item) {
  if (!item || !item.value) {
    return null
  }

  let value = item.value
  if (item.name === 'Viber') {
    value = value.replace(/[\s\-()]/g, '').replace(/\+/, '%2B')
  }

  return `${item.href || ''}${value}${item.hrefEnd || ''}`
}

function buildVcardText(cardData, hostedUrl) {
  const genInfo = normalizeGenInfoAddress(cardData.genInfo || {})
  const primaryActions = cardData.primaryActions || []
  const secondaryActions = cardData.secondaryActions || []

  const getNumber = (type) => {
    const item = primaryActions.find((entry) => entry.name === type && entry.value)
    return item ? item.value.replace(/\s/g, '') : null
  }

  const email = primaryActions.find((entry) => entry.name === 'Email' && entry.value)
  const website = primaryActions.find(
    (entry) => entry.name === 'Website' && entry.value
  )
  const urls = [...primaryActions, ...secondaryActions.map((item) => ({ ...item, isURL: 1 }))]
    .filter((item) => item.isURL && item.value)
    .map((item) => `URL;TYPE=${item.name}:${getActionUrl(item)}`)

  const fullName = [genInfo.fname, genInfo.lname].filter(Boolean).join(' ') || null

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${genInfo.lname || ''};${genInfo.fname || ''};;;`,
    `FN:${fullName || ''}`,
    `ORG:${genInfo.biz || ''}`,
    `ADR;TYPE=WORK:${buildVcardAddressValue(genInfo)}`,
    `TITLE:${genInfo.title || ''}`,
    `TEL;TYPE=CELL:${getNumber('Mobile') || ''}`,
    `TEL;TYPE=WORK:${getNumber('Office') || ''}`,
    `TEL;TYPE=HOME:${getNumber('Home') || ''}`,
    `TEL;TYPE=MSG:${getNumber('SMS') || ''}`,
    `EMAIL;TYPE=WORK:${email ? email.value : ''}`,
    `URL;TYPE=Digital Business Card:${hostedUrl || ''}`,
    `URL:${website ? website.value : ''}`,
    ...urls,
    `UID:EnBizCard-${cardData.id || cardData.slug || 'hosted'}`,
    'END:VCARD',
  ]

  return `${lines.join('\n')}\n`
}

module.exports = {
  buildVcardText,
}
