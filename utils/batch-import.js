import JSZip from 'jszip'

export const BATCH_TEMPLATE_SHEET_NAME = 'cards'
export const BATCH_TEMPLATE_HELP_SHEET_NAME = 'instructions'
export const BATCH_IMPORT_LIMIT = 200

const XML_NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

const baseGenInfoColumns = [
  {
    header: 'first_name',
    label: 'First name',
    description: 'Card holder first name',
    example: 'Ada',
    fieldType: 'genInfo',
    key: 'fname',
  },
  {
    header: 'last_name',
    label: 'Last name',
    description: 'Card holder last name',
    example: 'Lovelace',
    fieldType: 'genInfo',
    key: 'lname',
  },
  {
    header: 'pronouns',
    label: 'Pronouns',
    description: 'Gender pronouns',
    example: 'She/Her',
    fieldType: 'genInfo',
    key: 'pronouns',
  },
  {
    header: 'job_title',
    label: 'Job title',
    description: 'Job title shown on the card',
    example: 'Research Scientist',
    fieldType: 'genInfo',
    key: 'title',
  },
  {
    header: 'business_name',
    label: 'Business name',
    description: 'Business or organization name',
    example: 'Analytical Engines Ltd.',
    fieldType: 'genInfo',
    key: 'biz',
  },
  {
    header: 'street',
    label: 'Street',
    description: 'Business street name',
    example: 'Bahnhofstrasse',
    fieldType: 'genInfo',
    key: 'street',
  },
  {
    header: 'street_number',
    label: 'Street number',
    description: 'Business street number',
    example: '12A',
    fieldType: 'genInfo',
    key: 'streetNo',
  },
  {
    header: 'zip',
    label: 'ZIP',
    description: 'Business ZIP or postal code',
    example: '8001',
    fieldType: 'genInfo',
    key: 'zip',
  },
  {
    header: 'city',
    label: 'City',
    description: 'Business city',
    example: 'Zurich',
    fieldType: 'genInfo',
    key: 'city',
  },
  {
    header: 'country',
    label: 'Country',
    description: 'Business country',
    example: 'Switzerland',
    fieldType: 'genInfo',
    key: 'country',
  },
]

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnLabelFromIndex(index) {
  let value = index + 1
  let label = ''

  while (value > 0) {
    const remainder = (value - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    value = Math.floor((value - 1) / 26)
  }

  return label
}

function columnIndexFromLabel(label) {
  return String(label || '')
    .toUpperCase()
    .split('')
    .reduce((result, char) => result * 26 + char.charCodeAt(0) - 64, 0) - 1
}

function cellRef(colIndex, rowIndex) {
  return `${columnLabelFromIndex(colIndex)}${rowIndex + 1}`
}

function createInlineStringCell(value, colIndex, rowIndex) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return `<c r="${cellRef(colIndex, rowIndex)}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    value
  )}</t></is></c>`
}

function buildWorksheetXml(rows) {
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => createInlineStringCell(value, colIndex, rowIndex))
        .filter(Boolean)
        .join('')

      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="${XML_NS}">
  <sheetData>${sheetRows}</sheetData>
</worksheet>`
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
}

function buildRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="${REL_NS}/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
}

function buildWorkbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="${XML_NS}" xmlns:r="${REL_NS}">
  <sheets>
    <sheet name="${BATCH_TEMPLATE_SHEET_NAME}" sheetId="1" r:id="rId1"/>
    <sheet name="${BATCH_TEMPLATE_HELP_SHEET_NAME}" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`
}

function buildWorkbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="${REL_NS}/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="${REL_NS}/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="${REL_NS}/styles" Target="styles.xml"/>
</Relationships>`
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="${XML_NS}">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <color theme="1"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`
}

function parseXml(xmlText) {
  const parser = new DOMParser()
  return parser.parseFromString(xmlText, 'application/xml')
}

function getCellValue(cell, sharedStrings) {
  const type = cell.getAttribute('t')

  if (type === 'inlineStr') {
    const inline = cell.getElementsByTagNameNS(XML_NS, 't')[0]
    return inline ? inline.textContent : ''
  }

  const valueNode = cell.getElementsByTagNameNS(XML_NS, 'v')[0]
  const value = valueNode ? valueNode.textContent : ''

  if (type === 's') {
    const index = Number(value)
    return Number.isInteger(index) && sharedStrings[index] !== undefined
      ? sharedStrings[index]
      : ''
  }

  if (type === 'b') {
    return value === '1' ? 'TRUE' : 'FALSE'
  }

  return value
}

function buildExampleRow(columns) {
  const exampleMap = {
    first_name: 'Ada',
    last_name: 'Lovelace',
    pronouns: 'She/Her',
    job_title: 'Research Scientist',
    business_name: 'Analytical Engines Ltd.',
    street: 'Bahnhofstrasse',
    street_number: '12A',
    zip: '8001',
    city: 'Zurich',
    country: 'Switzerland',
    mobile: '+41 79 123 45 67',
    email: 'ada@example.com',
    website: 'https://example.com',
    linkedin: 'in/ada-lovelace',
  }

  return columns.map((column) => exampleMap[column.header] || '')
}

function buildHelpRows(columns) {
  const rows = [
    ['Section', 'Header', 'Description', 'Example'],
    [
      'Notes',
      '',
      'Create one vCard per row in the cards sheet. Leave columns blank when a field is not needed.',
      '',
    ],
    [
      'Notes',
      '',
      'Logo and cover are shared from the editor and are not part of the spreadsheet. Profile photos are ignored in batch mode.',
      '',
    ],
    [
      'Notes',
      '',
      'Phone numbers, usernames, IDs, and ZIP codes should be stored as text in Excel if leading zeros or plus signs must be preserved.',
      '',
    ],
  ]

  columns.forEach((column) => {
    rows.push([
      column.sectionLabel,
      column.header,
      column.description,
      column.example || '',
    ])
  })

  return rows
}

export function normalizeBatchHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function buildBatchImportColumns(actionCatalog) {
  const actionColumns = []

  if (actionCatalog && Array.isArray(actionCatalog.primaryActions)) {
    actionCatalog.primaryActions.forEach((action) => {
      actionColumns.push({
        header: normalizeBatchHeader(action.name),
        label: action.name,
        description: action.label || action.placeholder || `${action.name} value`,
        example: action.placeholder || '',
        fieldType: 'action',
        actionGroup: 'primaryActions',
        actionName: action.name,
        sectionLabel: 'Primary actions',
      })
    })
  }

  if (actionCatalog && Array.isArray(actionCatalog.secondaryActions)) {
    actionCatalog.secondaryActions.forEach((action) => {
      actionColumns.push({
        header: normalizeBatchHeader(action.name),
        label: action.name,
        description: action.label || action.placeholder || `${action.name} value`,
        example: action.placeholder || '',
        fieldType: 'action',
        actionGroup: 'secondaryActions',
        actionName: action.name,
        sectionLabel: 'Secondary actions',
      })
    })
  }

  return [
    ...baseGenInfoColumns.map((column) => ({
      ...column,
      sectionLabel: 'Contact information',
    })),
    ...actionColumns,
  ]
}

export async function createBatchTemplateWorkbook(columns) {
  const zip = new JSZip()
  const cardRows = [columns.map((column) => column.header), buildExampleRow(columns)]
  const helpRows = buildHelpRows(columns)

  zip.file('[Content_Types].xml', buildContentTypesXml())
  zip.folder('_rels').file('.rels', buildRootRelsXml())
  zip.folder('xl').file('workbook.xml', buildWorkbookXml())
  zip.folder('xl').folder('_rels').file('workbook.xml.rels', buildWorkbookRelsXml())
  zip.folder('xl').file('styles.xml', buildStylesXml())
  zip.folder('xl').folder('worksheets').file('sheet1.xml', buildWorksheetXml(cardRows))
  zip
    .folder('xl')
    .folder('worksheets')
    .file('sheet2.xml', buildWorksheetXml(helpRows))

  return zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function parseBatchWorkbook(file) {
  const zip = await JSZip.loadAsync(file)
  const workbookXml = await zip.file('xl/workbook.xml').async('string')
  const workbookRelsXml = await zip.file('xl/_rels/workbook.xml.rels').async('string')

  const workbookDoc = parseXml(workbookXml)
  const workbookRelsDoc = parseXml(workbookRelsXml)

  const relTargetById = new Map()
  Array.from(
    workbookRelsDoc.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/package/2006/relationships',
      'Relationship'
    )
  ).forEach((relationship) => {
    relTargetById.set(
      relationship.getAttribute('Id'),
      relationship.getAttribute('Target')
    )
  })

  const sheets = Array.from(workbookDoc.getElementsByTagNameNS(XML_NS, 'sheet'))
  const preferredSheet =
    sheets.find(
      (sheet) =>
        String(sheet.getAttribute('name') || '').toLowerCase() ===
        BATCH_TEMPLATE_SHEET_NAME
    ) || sheets[0]

  if (!preferredSheet) {
    return []
  }

  const relId = preferredSheet.getAttributeNS(REL_NS, 'id') || preferredSheet.getAttribute('r:id')
  const target = relTargetById.get(relId)

  if (!target) {
    return []
  }

  const worksheetPath = target.startsWith('xl/')
    ? target
    : `xl/${target.replace(/^\/+/, '')}`
  const worksheetXml = await zip.file(worksheetPath).async('string')

  let sharedStrings = []
  const sharedStringsFile = zip.file('xl/sharedStrings.xml')
  if (sharedStringsFile) {
    const sharedStringsXml = await sharedStringsFile.async('string')
    const sharedStringsDoc = parseXml(sharedStringsXml)
    sharedStrings = Array.from(
      sharedStringsDoc.getElementsByTagNameNS(XML_NS, 'si')
    ).map((item) => {
      return Array.from(item.getElementsByTagNameNS(XML_NS, 't'))
        .map((node) => node.textContent)
        .join('')
    })
  }

  const worksheetDoc = parseXml(worksheetXml)
  const rows = Array.from(worksheetDoc.getElementsByTagNameNS(XML_NS, 'row')).map(
    (rowNode) => {
      const values = []

      Array.from(rowNode.getElementsByTagNameNS(XML_NS, 'c')).forEach((cell) => {
        const reference = cell.getAttribute('r') || ''
        const columnLabel = reference.replace(/[0-9]+/g, '')
        const columnIndex = columnIndexFromLabel(columnLabel)
        values[columnIndex] = getCellValue(cell, sharedStrings)
      })

      return values
    }
  )

  if (!rows.length) {
    return []
  }

  const headers = rows[0].map((header) => String(header || '').trim())

  return rows
    .slice(1)
    .map((row) => {
      const mapped = {}
      let hasValue = false

      headers.forEach((header, index) => {
        if (!header) {
          return
        }

        const value = row[index]
        const normalizedValue =
          value === null || value === undefined ? '' : String(value).trim()

        if (normalizedValue) {
          hasValue = true
        }

        mapped[header] = normalizedValue
      })

      return hasValue ? mapped : null
    })
    .filter(Boolean)
}
