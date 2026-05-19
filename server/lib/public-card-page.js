const fs = require('fs')
const path = require('path')
const { formatAddress, normalizeGenInfoAddress } = require('../../utils/address')

const projectRoot = process.cwd()
const iconsDir = path.join(projectRoot, 'assets', 'icons')

const themeStyles = {
  1: fs.readFileSync(path.join(projectRoot, 'assets', 'styles', 'T1.min.css'), 'utf8'),
  2: fs.readFileSync(path.join(projectRoot, 'assets', 'styles', 'T2.min.css'), 'utf8'),
  3: fs.readFileSync(path.join(projectRoot, 'assets', 'styles', 'T3.min.css'), 'utf8'),
}

const qrcodeScript = fs.readFileSync(
  path.join(projectRoot, 'static', 'qrcode.min.js'),
  'utf8'
)

const mediaScript = fs.readFileSync(
  path.join(projectRoot, 'assets', 'scripts', 'media.js'),
  'utf8'
)

const faviconBase64 = fs.readFileSync(
  path.join(projectRoot, 'static', 'favicon-32x32.png')
).toString('base64')

const iconCache = new Map()

function readIcon(name) {
  const safeName = /^[a-z0-9-]+$/i.test(name || '') ? name : 'brand'
  if (!iconCache.has(safeName)) {
    const filePath = path.join(iconsDir, `${safeName}.svg`)
    const fallbackPath = path.join(iconsDir, 'brand.svg')
    try {
      iconCache.set(safeName, fs.readFileSync(filePath, 'utf8'))
    } catch (error) {
      iconCache.set(safeName, fs.readFileSync(fallbackPath, 'utf8'))
    }
  }
  return iconCache.get(safeName)
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(value) {
  return escapeHtml(value)
}

function hasLightBG(color) {
  let hex = (color || '').replace('#', '')
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return false
  }
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
  return brightness > 125
}

function getFontFamily(fontCss) {
  if (!fontCss) {
    return null
  }
  const match = String(fontCss).trim().match(/^font-family[^;]*/i)
  return match ? match[0] : null
}

function getActionHref(item) {
  if (!item || !item.value) {
    return null
  }

  let value = item.value
  if (item.name === 'Viber') {
    value = value.replace(/[\s\-()]/g, '').replace(/\+/, '%2B')
  }

  return `${item.href || ''}${value}${item.hrefEnd || ''}`
}

function getActionLabel(name) {
  if (!name) {
    return ''
  }
  return name.substr(0, 1).toUpperCase() + name.slice(1)
}

function sanitizeFilename(value, fallback) {
  const normalized = String(value || fallback || '')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return normalized || fallback
}

function stripEmbedSrc(value) {
  if (typeof value !== 'string') {
    return null
  }

  if (/<iframe[\s\S]*<\/iframe>/i.test(value)) {
    const iframe = value.match(/<iframe[\s\S]*<\/iframe>/i)[0]
    const src = iframe.match(/src="?([^"\s]+)"/i)
    return src ? src[1] : null
  }

  if (/\/\/www\.instagram\.com\/embed\.js/.test(value)) {
    const permalink = value.match(/data-instgrm-permalink="(.*?)\/\?/i)
    return permalink ? `${permalink[1]}/embed/captioned` : null
  }

  return null
}

function sectionHasRenderableContent(section) {
  if (!section || !Array.isArray(section.content)) {
    return false
  }

  return section.content.some((item) => {
    if (!item) {
      return false
    }
    if (typeof item === 'string') {
      return Boolean(stripEmbedSrc(item))
    }
    if (item.contentType === 'text') {
      return Boolean(item.value)
    }
    if (item.contentType === 'product') {
      return Boolean(item.title)
    }
    if (item.contentType === 'media') {
      return Boolean(item.title || item.dataURI || item.coverDataURI)
    }
    return false
  })
}

function getThemeCss(theme) {
  return themeStyles[theme] || themeStyles[1]
}

function getThemeRadius(theme) {
  return theme === 1 ? '5rem' : '0.5rem'
}

function renderPrimaryAction(item, colors) {
  const href = getActionHref(item)
  if (!href) {
    return ''
  }

  return `
    <div class="actionsC">
      <div class="actionBtn">
        <a
          href="${escapeAttr(href)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="${escapeAttr(item.name || 'Action')}"
          style="background-color:${escapeAttr(colors.buttonBg.color)}"
        ><div class="icon iconColor">${readIcon(item.icon)}</div></a>
        <p class="textColor">${escapeHtml(getActionLabel(item.name))}</p>
      </div>
    </div>
  `
}

function renderDocumentItem(item, colors) {
  const downloadName = `${sanitizeFilename(item.title || 'document', 'document')}.pdf`
  return `
    <div class="media" style="background-color:${escapeAttr(colors.cardBg.color)}">
      <div class="mediaC">
        <div>
          <img src="${escapeAttr(item.coverDataURI || '')}" alt="${escapeAttr(
            item.title || 'Document cover'
          )}" />
        </div>
        <div class="controls cardColor">
          <p class="title">${escapeHtml(item.title || '')}</p>
          <div class="docDl">
            <p class="fileSize sub">${escapeHtml(`PDF - ${item.filesize || ''}`)}</p>
            <a
              class="dlBtn"
              href="${escapeAttr(item.dataURI || '')}"
              download="${escapeAttr(downloadName)}"
              target="_blank"
              rel="noreferrer"
              style="background-color:${escapeAttr(colors.buttonBg.color)}"
              aria-label="Download ${escapeAttr(item.title || 'document')}"
            ><div class="icon iconColor">${readIcon('download')}</div></a>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderMediaItem(item, colors) {
  if (item.type === 'image') {
    return `
      <div class="media image" style="background-color:${escapeAttr(colors.cardBg.color)}">
        <div>
          <img src="${escapeAttr(item.dataURI || '')}" alt="${escapeAttr(
            item.title || 'Image'
          )}" />
          <div class="controls cardColor">
            <p class="title">${escapeHtml(item.title || '')}</p>
          </div>
        </div>
      </div>
    `
  }

  if (item.type === 'music' || item.type === 'video') {
    const sourceSrc = item.dataURI ? `${item.dataURI}#t=0.2` : ''
    const coverBlock =
      item.type === 'music' && item.coverDataURI
        ? `<img src="${escapeAttr(item.coverDataURI)}" alt="${escapeAttr(
            item.title || 'cover'
          )}" />`
        : ''

    return `
      <div class="media ${escapeAttr(item.type)}" style="background-color:${escapeAttr(
        colors.cardBg.color
      )}">
        <div class="mediaC">
          <video
            ${item.type === 'video' ? '' : 'style="display:none"'}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            preload="metadata"
            class="source"
          >
            <source src="${escapeAttr(sourceSrc)}" />
          </video>
          ${coverBlock}
          <div class="controls cardColor">
            <p class="title">${escapeHtml(item.title || '')}</p>
            ${
              item.artist
                ? `<p class="sub"><span>${escapeHtml(item.artist)}</span>${
                    item.album ? `<span> - ${escapeHtml(item.album)}</span>` : ''
                  }</p>`
                : ''
            }
            <div class="pCtrl">
              <output class="currentTime sub">00:00</output>
              <a
                class="playPause"
                style="background-color:${escapeAttr(colors.buttonBg.color)}"
                aria-label="Play or pause media"
              >
                <div class="icon play iconColor">${readIcon('play')}</div>
                <div class="icon pause iconColor">${readIcon('pause')}</div>
              </a>
              <input class="seekBar seekbarColor" type="range" value="0" />
            </div>
          </div>
        </div>
      </div>
    `
  }

  if (item.type === 'document') {
    return renderDocumentItem(item, colors)
  }

  return ''
}

function renderProductItem(item, colors) {
  return `
    <div class="media" style="background-color:${escapeAttr(colors.cardBg.color)}">
      ${item.image && item.image.dataURI ? `<img src="${escapeAttr(item.image.dataURI)}" alt="${escapeAttr(item.image.title || 'Product image')}" />` : ''}
      <div class="controls cardColor prodInfo">
        <p class="title">${escapeHtml(item.title || '')}</p>
        ${item.description ? `<p class="sub">${escapeHtml(item.description)}</p>` : ''}
        ${item.price ? `<p class="price">${escapeHtml(item.price)}</p>` : ''}
        ${
          item.label
            ? `<a
                class="label"
                style="background-color:${escapeAttr(colors.buttonBg.color)};line-height:inherit"
                target="_blank"
                rel="noopener noreferrer"
                href="${escapeAttr(item.link || '#')}"
              ><p class="iconColor">${escapeHtml(item.label)}</p></a>`
            : ''
        }
      </div>
    </div>
  `
}

function renderFeaturedSection(section, colors) {
  if (!sectionHasRenderableContent(section)) {
    return ''
  }

  const content = (section.content || [])
    .map((item) => {
      if (!item) {
        return ''
      }

      if (typeof item === 'string') {
        const src = stripEmbedSrc(item)
        if (!src) {
          return ''
        }
        return `
          <div class="media embedded" style="background-color:${escapeAttr(
            colors.cardBg.color
          )}">
            <iframe src="${escapeAttr(src)}" frameborder="0" allowfullscreen></iframe>
          </div>
        `
      }

      if (item.contentType === 'media') {
        return renderMediaItem(item, colors)
      }

      if (item.contentType === 'product' && item.title) {
        return renderProductItem(item, colors)
      }

      if (item.contentType === 'text' && item.value) {
        return `
          <div class="media" style="background-color:${escapeAttr(colors.cardBg.color)}">
            <p class="textC cardColor">${escapeHtml(item.value)}</p>
          </div>
        `
      }

      return ''
    })
    .join('')

  if (!content.trim()) {
    return ''
  }

  return `
    <div class="featured">
      ${section.title ? `<h2 class="section textColor">${escapeHtml(section.title)}</h2>` : ''}
      ${content}
    </div>
  `
}

function renderPublicCardPage({
  card,
  hostedUrl,
  vcardPath,
  manifestPath,
  appleTouchIconPath,
  icon192Path,
}) {
  const data = card.data || {}
  const theme = Number(data.theme || 1)
  const colors = {
    logoBg: { color: ((data.colors || {}).logoBg || {}).color || '#000000' },
    mainBg: { color: ((data.colors || {}).mainBg || {}).color || '#ddd' },
    buttonBg: { color: ((data.colors || {}).buttonBg || {}).color || '#7dd3fc' },
    cardBg: { color: ((data.colors || {}).cardBg || {}).color || '#fff' },
  }
  const genInfo = normalizeGenInfoAddress(data.genInfo || {})
  const images = data.images || {}
  const primaryActions = Array.isArray(data.primaryActions) ? data.primaryActions : []
  const secondaryActions = Array.isArray(data.secondaryActions)
    ? data.secondaryActions
    : []
  const combinedActions = [...primaryActions, ...secondaryActions]
  const featured = Array.isArray(data.featured) ? data.featured : []
  const fullName =
    [genInfo.fname, genInfo.lname].filter(Boolean).join(' ') || 'Digital Business Card'
  const description = 'Hosted digital business card generated with xuno vcard generator.'
  const businessAddress = formatAddress(genInfo)
  const fontFamily = getFontFamily(genInfo.fontCss)
  const mainIsLight = hasLightBG(colors.mainBg.color)
  const buttonIsLight = hasLightBG(colors.buttonBg.color)
  const cardIsLight = hasLightBG(colors.cardBg.color)
  const hasOnlyProfilePic = !((images.cover || {}).url || (images.logo || {}).url)
  const logoMargin = (images.photo || {}).url
    ? (images.cover || {}).url
      ? '3rem 0 6rem'
      : '3rem 0 8rem'
    : '3rem 0'
  const primaryActionMarkup = combinedActions
    .map((item) => renderPrimaryAction(item, colors))
    .join('')
  const featuredMarkup = featured
    .map((section) => renderFeaturedSection(section, colors))
    .join('')
  const buttonRadius = getThemeRadius(theme)
  const themeCss = getThemeCss(theme)
  const trackerMarkup = genInfo.tracker || ''
  const fontLinkMarkup = genInfo.fontLink || ''

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="author" content="xuno vcard generator" />
    <meta name="designer" content="Vishnu Raghav" />
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="theme-color" content="#111827" />
    <meta name="application-name" content="${escapeAttr(fullName)}" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-title" content="${escapeAttr(fullName)}" />
    <meta property="og:title" content="${escapeAttr(`${fullName}'s Digital Business Card`)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeAttr(hostedUrl)}" />
    <meta property="twitter:title" content="${escapeAttr(
      `${fullName}'s Digital Business Card`
    )}" />
    <meta property="twitter:description" content="${escapeAttr(description)}" />
    <title>${escapeHtml(`${fullName}'s Digital Business Card`)}</title>
    <link rel="icon" type="image/png" href="data:image/png;base64,${faviconBase64}" />
    <link rel="icon" type="image/png" sizes="192x192" href="${escapeAttr(icon192Path)}" />
    <link rel="apple-touch-icon" sizes="180x180" href="${escapeAttr(appleTouchIconPath)}" />
    <link rel="manifest" href="${escapeAttr(manifestPath)}" />
    ${fontLinkMarkup}
    <style>
      #body{font-family:sans-serif;}input[type='range']::-moz-range-track{background:none;}input[type='range']::-moz-range-thumb{-moz-appearance:none;width:1.5rem;height:1.5rem;border-radius:${
        theme === 1 ? '100%' : '.25rem'
      };border:none;background:${colors.buttonBg.color};z-index:3;cursor:pointer;}input[type='range']::-webkit-slider-thumb{-webkit-appearance:none;width:1.5rem;height:1.5rem;border-radius:${
        theme === 1 ? '100%' : '.25rem'
      };border:none;background:${colors.buttonBg.color};z-index:3;cursor:pointer;}.closeColor{${
        mainIsLight ? 'filter:invert(1);' : ''
      }}.iconColor{color:#eee;${buttonIsLight ? 'filter:invert(1);' : ''}}.cardColor{${
        cardIsLight ? 'color:#222 !important;' : ''
      }}.textColor{${mainIsLight ? 'color:#222 !important;' : 'color:#eee !important;'}}.seekbarColor{background:${colors.buttonBg.color}80 !important;}
      ${fontFamily ? `#body{${fontFamily}}` : ''}
      ${theme === 3 ? `#info{border-left:.25rem dashed ${colors.buttonBg.color}} .section{border-left:.25rem solid ${colors.buttonBg.color}}` : ''}
    </style>
    <style>${themeCss}</style>
    <style>
      html{background:#1f2937;min-height:100%}
      body{margin:0;max-width:none !important;width:100%;min-height:100vh;min-height:100dvh;background:#1f2937;color:#eee}
      #cardFrame{margin:0 auto;max-width:30rem;width:100%;min-height:100vh;min-height:100dvh;position:relative;background:${escapeAttr(
        colors.logoBg.color
      )}}
      header{background:${escapeAttr(colors.logoBg.color)}}
      .ctaRow{display:flex;align-items:stretch;justify-content:center;gap:.75rem;margin-top:2rem;width:100%}
      #cta{margin-top:0 !important;width:auto !important;flex:0 0 auto !important;min-width:3.5rem;padding:1rem !important}
      #cta .icon{margin-right:0 !important}
      .ctaSideAction{display:inline-flex;align-items:center;justify-content:center;min-width:3.5rem;padding:1rem;border:none;border-radius:${buttonRadius};cursor:pointer;line-height:0;box-sizing:border-box}
      .ctaSideAction .icon{margin:0}
      .ctaSideAction .icon svg,.ctaSideAction .icon path,.ctaSideAction .icon circle,.ctaSideAction .icon ellipse,.ctaSideAction .icon rect,.ctaSideAction .icon polygon,.ctaSideAction .icon line,.ctaSideAction .icon polyline{pointer-events:none}
      @media screen and (min-width:768px){
        body{display:flex;align-items:center;justify-content:center;padding:2rem;box-sizing:border-box}
        #cardFrame{min-height:0;max-height:calc(100vh - 4rem);overflow-y:auto;border:4px solid #000;border-radius:2rem;box-shadow:0 24px 60px rgba(0,0,0,.45)}
      }
    </style>
    ${trackerMarkup}
  </head>
  <body id="body">
    <div id="cardFrame">
      <div id="modal" style="background-color:${escapeAttr(
        colors.mainBg.color
      )};visibility:hidden;top:2rem;opacity:0">
        <a id="close" class="closeColor" aria-label="Close"><div class="icon">${readIcon(
          'close'
        )}</div></a>
        <div id="copyView" style="display:none">
          <p class="textColor">Copy and send the URL to share my Business Card</p>
          <button id="copyURL" style="background-color:${escapeAttr(colors.buttonBg.color)}">
            <div class="icon iconColor">${readIcon('copy')}</div>
            <span class="iconColor">Copy URL</span>
          </button>
        </div>
        <div id="qrView" class="textColor" style="display:none">
          <div id="qr"></div>
          <h3>${escapeHtml(fullName)}</h3>
          ${genInfo.title ? `<p>${escapeHtml(genInfo.title)}</p>` : ''}
        </div>
      </div>

      <header>
        <div class="headerImgC">
          ${
            (images.cover || {}).url
              ? `<img id="cover" src="${escapeAttr(images.cover.url)}" alt="Background Pattern" />`
              : ''
          }
          ${
            (images.logo || {}).url
              ? `<img id="logo" src="${escapeAttr(images.logo.url)}" alt="Logo" style="margin:${logoMargin}" />`
              : ''
          }
        </div>
      </header>

      <main style="background-color:${escapeAttr(colors.mainBg.color)};margin-top:${
        hasOnlyProfilePic ? '5rem' : '0'
      }">
        ${
          (images.photo || {}).url
            ? `<img id="profilePhoto" src="${escapeAttr(
                images.photo.url
              )}" alt="Photo" />`
            : ''
        }
        <div id="info" class="textColor">
          <p class="name">${escapeHtml(fullName)}</p>
          ${genInfo.pronouns ? `<p class="pronouns">(${escapeHtml(genInfo.pronouns)})</p>` : ''}
          ${genInfo.title ? `<p class="jobtitle">${escapeHtml(genInfo.title)}</p>` : ''}
          ${genInfo.biz ? `<p class="bizname">${escapeHtml(genInfo.biz)}</p>` : ''}
          ${businessAddress ? `<p class="bizaddr">${escapeHtml(businessAddress)}</p>` : ''}
        </div>

        <div class="ctaRow">
          <a
            id="cta"
            rel="noreferrer"
            href="${escapeAttr(vcardPath)}"
            download="${escapeAttr(`${sanitizeFilename(fullName, 'digital-business-card')}.vcf`)}"
            target="_blank"
            aria-label="Save Contact"
            style="background-color:${escapeAttr(colors.buttonBg.color)}"
          ><div class="icon iconColor">${readIcon('add-user')}</div></a>
          <button
            id="shareAction"
            type="button"
            class="ctaSideAction"
            aria-label="Share Card"
            style="background-color:${escapeAttr(colors.buttonBg.color)}"
          ><div class="icon iconColor">${readIcon('share')}</div></button>
          <button
            id="showQR"
            type="button"
            class="ctaSideAction"
            aria-label="Show QR Code"
            style="background-color:${escapeAttr(colors.buttonBg.color)}"
          ><div class="icon iconColor">${readIcon('qrcode')}</div></button>
        </div>

        ${primaryActionMarkup ? `<div class="actions">${primaryActionMarkup}</div>` : ''}
        ${featuredMarkup}
      </main>
    </div>

    <script>${qrcodeScript}</script>
    <script>
      (function () {
        const modal = document.getElementById('modal')
        const closeButton = document.getElementById('close')
        const copyView = document.getElementById('copyView')
        const qrView = document.getElementById('qrView')
        const copyButton = document.getElementById('copyURL')
        const shareButton = document.getElementById('shareAction')
        const qrButton = document.getElementById('showQR')
        const qr = document.getElementById('qr')
        const shareUrl = ${JSON.stringify(hostedUrl)}

        function toggleModal(forceOpen) {
          const shouldOpen =
            typeof forceOpen === 'boolean' ? forceOpen : modal.style.top === '2rem'

          if (shouldOpen) {
            modal.style.visibility = 'visible'
            modal.style.top = '0px'
            modal.style.opacity = '1'
            return
          }

          modal.style.top = '2rem'
          modal.style.opacity = '0'
          setTimeout(() => {
            modal.style.visibility = 'hidden'
          }, 200)
        }

        function hideViews() {
          copyView.style.display = 'none'
          qrView.style.display = 'none'
        }

        function renderQrCode() {
          if (!qr || !window.QRCode) {
            return
          }

          qr.innerHTML = new window.QRCode({
            content: shareUrl,
            container: 'svg-viewbox',
            join: true,
            ecl: 'L',
            padding: 0,
          }).svg()
        }

        function openCopyView() {
          toggleModal(true)
          hideViews()
          copyView.style.display = 'flex'
        }

        function openQrView() {
          toggleModal(true)
          hideViews()
          qrView.style.display = 'block'
          renderQrCode()
        }

        shareButton.addEventListener('click', () => {
          if (navigator.share) {
            navigator
              .share({
                title: document.title,
                text: 'You can view my Digital Business Card here:',
                url: shareUrl,
              })
              .catch(() => {})
            return
          }
          openCopyView()
        })

        qrButton.addEventListener('click', openQrView)

        closeButton.addEventListener('click', () => toggleModal(false))

        copyButton.addEventListener('click', async () => {
          const actionLabel = copyButton.querySelectorAll('.iconColor')[1]
          try {
            await navigator.clipboard.writeText(shareUrl)
            if (actionLabel) {
              actionLabel.innerText = 'Copied'
              setTimeout(() => {
                actionLabel.innerText = 'Copy URL'
              }, 1000)
            }
          } catch (error) {
            openCopyView()
          }
        })
      })()
    </script>
    ${
      featured.some((section) =>
        Array.isArray(section && section.content) &&
        section.content.some(
          (item) => item && item.contentType === 'media' && /^(music|video)$/.test(item.type)
        )
      )
        ? `<script>${mediaScript}</script>`
        : ''
    }
  </body>
</html>`
}

module.exports = {
  renderPublicCardPage,
}
