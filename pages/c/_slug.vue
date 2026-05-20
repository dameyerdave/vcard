<template>
  <div class="relative min-h-screen bg-gray-800 text-gray-100">
    <Modal
      v-if="content"
      @click.native.self="clearContent"
      :content="content"
      :clearContent="clearContent"
    />

    <div
      v-if="loading"
      class="flex min-h-screen items-center justify-center px-4 py-12 text-center"
    >
      <p class="text-lg text-gray-300">Loading business card…</p>
    </div>

    <div
      v-else-if="error"
      class="flex min-h-screen items-center justify-center px-4 py-12 text-center"
    >
      <div>
        <h1 class="text-3xl font-extrabold">Card unavailable</h1>
        <p class="mt-4 text-gray-300">{{ error }}</p>
      </div>
    </div>

    <div
      v-else
      class="min-h-screen md:flex md:items-center md:justify-center md:px-8 md:py-8"
    >
      <Preview
        ref="html"
        :username="username"
        :genInfo="genInfo"
        :images="images"
        :featured="featured"
        :colors="colors"
        :primaryActions="primaryActions"
        :secondaryActions="secondaryActions"
        :PreviewMode="true"
        :downloadVcard="downloadVcard"
        :footerCredit="footerCredit"
        :showAlert="showAlert"
        :hasLightBG="hasLightBG"
        :shareEnabled="true"
        :shareUrl="hostedURL"
        :hostedView="true"
      />
      <Vcard ref="vCard" :vCard="vCard" />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Modal from '@/components/Modal'
import Preview from '@/components/Preview'
import Vcard from '@/components/Vcard'
import { downloadBlob } from '@/utils/download'
const { normalizeGenInfoAddress } = require('../../utils/address')

export default {
  components: {
    Modal,
    Preview,
    Vcard,
  },
  data() {
    return {
      loading: true,
      error: null,
      content: null,
      hostedURL: null,
      footerCredit: false,
      genInfo: {
        fname: null,
        lname: null,
        pronouns: null,
        title: null,
        biz: null,
        addr: null,
        street: null,
        streetNo: null,
        city: null,
        zip: null,
        country: null,
        desc: null,
        key: null,
        tracker: null,
        fontLink: null,
        fontCss: null,
      },
      images: {
        logo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        photo: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
        cover: {
          url: null,
          blob: null,
          ext: null,
          mime: null,
          resized: null,
        },
      },
      colors: {
        logoBg: {
          color: '#000000',
          openPalette: false,
        },
        mainBg: {
          color: '#ddd',
          openPalette: false,
        },
        buttonBg: {
          color: '#7dd3fc',
          openPalette: false,
        },
        cardBg: {
          color: '#fff',
          openPalette: false,
        },
      },
      primaryActions: [],
      secondaryActions: [],
      featured: [],
    }
  },
  head() {
    const fullName = this.getFullname
    return {
      title: fullName
        ? `${fullName}'s Digital Business Card`
        : 'Digital Business Card',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Hosted digital business card generated with xuno vcard generator.',
        },
      ],
    }
  },
  computed: {
    getFullname() {
      const fn = this.genInfo.fname
      const ln = this.genInfo.lname
      return (fn + ln).length ? `${fn ? fn : ''}${ln ? ' ' + ln : ''}` : null
    },
    username() {
      return this.getFullname
        ? this.getFullname.toLowerCase().replace(/\W+/g, '')
        : 'username'
    },
    vCard() {
      const getNumber = (type) => {
        const no = this.primaryActions
          .map((item) => (item.name === type ? item.value : null))
          .filter((item) => item)[0]
        return no ? no.replace(/\s/g, '') : null
      }

      const email = this.primaryActions
        .map((item) => (item.name === 'Email' ? item.value : null))
        .filter((item) => item)[0]
      const website = this.primaryActions
        .map((item) => (item.name === 'Website' ? item.value : null))
        .filter((item) => item)[0]
      const actions = [
        ...this.primaryActions,
        ...this.secondaryActions.map((item) => {
          return { ...item, isURL: 1 }
        }),
      ]
      const urls = actions
        .map((item) => {
          if (item.isURL && item.value) {
            return {
              title: item.name,
              url:
                (item.href ? item.href : '') +
                item.value +
                (item.hrefEnd ? item.hrefEnd : ''),
            }
          }
          return false
        })
        .filter((item) => item)

      return {
        fn: this.genInfo.fname,
        ln: this.genInfo.lname,
        title: this.genInfo.title,
        org: this.genInfo.biz,
        address: this.genInfo,
        cell: getNumber('Mobile'),
        work: getNumber('Office'),
        home: getNumber('Home'),
        sms: getNumber('SMS'),
        email,
        hostedURL: this.hostedURL,
        website,
        urls,
        uid: `EnBizCard-${this.$route.params.slug}`,
      }
    },
  },
  methods: {
    ...mapActions(['changeTheme']),
    async loadCard() {
      try {
        const response = await fetch(
          `/api/public/cards/${encodeURIComponent(this.$route.params.slug)}`
        )
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'The business card could not be loaded.')
        }

        const card = payload.card
        this.applyCard(card)
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    applyCard(card) {
      const data = card.data || {}
      this.hostedURL = card.url
      this.footerCredit = false
      this.genInfo = normalizeGenInfoAddress({
        ...this.genInfo,
        ...(data.genInfo || {}),
      })
      this.images = {
        logo: { ...this.images.logo, ...((data.images || {}).logo || {}) },
        photo: { ...this.images.photo, ...((data.images || {}).photo || {}) },
        cover: { ...this.images.cover, ...((data.images || {}).cover || {}) },
      }
      this.colors = {
        logoBg: { ...this.colors.logoBg, ...((data.colors || {}).logoBg || {}) },
        mainBg: { ...this.colors.mainBg, ...((data.colors || {}).mainBg || {}) },
        buttonBg: {
          ...this.colors.buttonBg,
          ...((data.colors || {}).buttonBg || {}),
        },
        cardBg: { ...this.colors.cardBg, ...((data.colors || {}).cardBg || {}) },
      }
      this.primaryActions = data.primaryActions || []
      this.secondaryActions = data.secondaryActions || []
      this.featured = data.featured || []
      this.changeTheme(data.theme || 1)
      this.installTrackingCode()
    },
    installTrackingCode() {
      document
        .querySelectorAll('[data-enbizcard-tracker]')
        .forEach((node) => node.remove())

      const tracker = this.genInfo.tracker
      const regex = /<script[^<]*<\/script>/g
      if (!tracker || !regex.test(tracker)) {
        return
      }

      const temp = document.createElement('div')
      temp.innerHTML = tracker
      Array.from(temp.querySelectorAll('script')).forEach((script) => {
        const nextScript = document.createElement('script')
        Array.from(script.attributes).forEach((attribute) => {
          nextScript.setAttribute(attribute.name, attribute.value)
        })
        nextScript.innerHTML = script.innerHTML
        nextScript.setAttribute('data-enbizcard-tracker', 'true')
        document.head.appendChild(nextScript)
      })
    },
    clearContent() {
      this.content = null
    },
    showAlert(content) {
      this.content = content
    },
    hasLightBG(key) {
      let hex = this.colors[key].color
      hex = hex.slice(1)
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)
      return brightness > 125
    },
    downloadVcard() {
      const blob = new Blob([this.$refs.vCard.$refs.vCard.innerText], {
        type: 'text/plain',
      })
      downloadBlob(blob, `${this.username}.vcf`)
    },
  },
  mounted() {
    this.loadCard()
  },
}
</script>
