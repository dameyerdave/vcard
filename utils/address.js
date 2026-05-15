function normalizeNullable(value) {
  if (value == null) {
    return null
  }

  const normalized = String(value).trim()
  return normalized ? normalized : null
}

function normalizeGenInfoAddress(genInfo = {}) {
  return {
    ...genInfo,
    addr: normalizeNullable(genInfo.addr),
    street: normalizeNullable(genInfo.street),
    streetNo: normalizeNullable(genInfo.streetNo || genInfo.streetNumber),
    city: normalizeNullable(genInfo.city),
    zip: normalizeNullable(genInfo.zip || genInfo.postalCode),
    country: normalizeNullable(genInfo.country),
  }
}

function hasStructuredAddress(genInfo = {}) {
  const address = normalizeGenInfoAddress(genInfo)
  return Boolean(
    address.street ||
      address.streetNo ||
      address.city ||
      address.zip ||
      address.country
  )
}

function buildStreetLine(genInfo = {}) {
  const address = normalizeGenInfoAddress(genInfo)
  return [address.street, address.streetNo].filter(Boolean).join(' ').trim() || null
}

function buildLocalityLine(genInfo = {}) {
  const address = normalizeGenInfoAddress(genInfo)
  return [address.zip, address.city].filter(Boolean).join(' ').trim() || null
}

function formatAddress(genInfo = {}) {
  const address = normalizeGenInfoAddress(genInfo)

  if (hasStructuredAddress(address)) {
    return [buildStreetLine(address), buildLocalityLine(address), address.country]
      .filter(Boolean)
      .join(', ')
  }

  return address.addr || ''
}

function escapeVcardValue(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\n|\r/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function buildVcardAddressValue(genInfo = {}) {
  const address = normalizeGenInfoAddress(genInfo)

  if (hasStructuredAddress(address)) {
    return [
      '',
      '',
      buildStreetLine(address) || '',
      address.city || '',
      '',
      address.zip || '',
      address.country || '',
    ]
      .map((part) => escapeVcardValue(part))
      .join(';')
  }

  if (address.addr) {
    return ['', '', address.addr, '', '', '', '']
      .map((part) => escapeVcardValue(part))
      .join(';')
  }

  return ';;;;;;'
}

module.exports = {
  buildVcardAddressValue,
  escapeVcardValue,
  formatAddress,
  hasStructuredAddress,
  normalizeGenInfoAddress,
}
