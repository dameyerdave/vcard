export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  ssr: false,
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'server',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  meta: {
    ogType: 'website',
    ogImage: '/maskable_512.png',
    // ogUrl: false,
    ogTitle: 'xuno vcard generator',
    ogDescription:
      'xuno vcard generator lets you create and host digital business cards.',
    ogSiteName: 'xuno vcard generator',
    theme_color: '#111827',
    author: 'Vishnu Raghav',
    lang: 'en',
    name: 'xuno vcard generator',
  },
  head: {
    title: 'xuno vcard generator',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'xuno vcard generator lets you create and host digital business cards.',
      },
      {
        hid: 'msapplication-TileColor',
        name: 'msapplication-TileColor',
        property: 'msapplication-TileColor',
        content: '#111827',
      },
      {
        hid: 'msapplication-TileImage',
        name: 'msapplication-TileImage',
        property: 'msapplication-TileImage',
        content: '/mstile-150x150.png',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico?v=2',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-16x16.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
      {
        rel: 'mask-icon',
        color: '#111827',
        href: '/safari-pinned-tab.svg',
      },
    ],
    script: [{ src: '/qrcode.min.js' }],
  },
  loading: false,
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [],
  router: {
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'vcard-slug',
        path: '/vcard/:slug',
        component: resolve(__dirname, 'pages/c/_slug.vue'),
      })
    },
  },
  serverMiddleware: ['~/server/public-card.js', '~/server/api.js'],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js modules
   */
  modules: ['@nuxtjs/tailwindcss'],
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    extend(config) {
      const includeQuery = /include/
      const svgPattern = /\.svg$/i
      const excludeSvgFromDefaultRules = (rule) => {
        if (Array.isArray(rule.oneOf)) {
          rule.oneOf.forEach(excludeSvgFromDefaultRules)
          return
        }

        if (!(rule.test instanceof RegExp) || !rule.test.test('.svg')) {
          return
        }

        if (!rule.exclude) {
          rule.exclude = [svgPattern]
          return
        }

        if (Array.isArray(rule.exclude)) {
          rule.exclude.push(svgPattern)
          return
        }

        rule.exclude = [rule.exclude, svgPattern]
      }

      config.module.rules.forEach(excludeSvgFromDefaultRules)

      config.module.rules.unshift({
        test: svgPattern,
        oneOf: [
          {
            resourceQuery: includeQuery,
            use: [
              {
                loader: 'raw-loader',
                options: {
                  esModule: false,
                },
              },
            ],
          },
          {
            use: [
              {
                loader: 'url-loader',
                options: {
                  esModule: false,
                  limit: 1000,
                  name: 'img/[name].[contenthash:7].[ext]',
                },
              },
            ],
          },
        ],
      })

      config.module.rules.push({
        test: /\.min.css|\.min.js$/,
        use: [
          {
            loader: 'raw-loader',
            options: {
              esModule: false,
            },
          },
        ],
        exclude: /(node_modules)/,
      })
    },
    html: {
      minify: {
        collapseBooleanAttributes: true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
        html5: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        sortClassName: true,
        trimCustomFragments: true,
        useShortDoctype: true,
      },
    },
  },
  telemetry: false,
}
