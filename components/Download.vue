<template>
  <div id="downloadSection" :class="containerClass">
    <section
      v-if="showCardsSection"
      class="overflow-hidden rounded-2xl border border-gray-800 bg-black"
    >
      <div
        class="flex flex-col gap-3 border-b border-gray-800 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6"
      >
        <div>
          <h3 class="font-extrabold text-xl">Your published cards</h3>
          <p class="mt-1 text-sm text-gray-400">
            Manage every live card stored for this Cloudflare account.
          </p>
        </div>
        <p v-if="cardsLoading" class="text-sm text-gray-400">Refreshing…</p>
      </div>

      <div v-if="cardsLoading && !userCards.length" class="px-4 py-6 text-gray-400 sm:px-6">
        Loading published cards…
      </div>

      <div
        v-else-if="!userCards.length"
        class="px-4 py-6 text-gray-400 sm:px-6"
      >
        No cards have been published for this user yet.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left" style="min-width: 780px">
          <thead class="bg-gray-900 text-xs uppercase tracking-widest text-gray-500">
            <tr>
              <th class="px-4 py-3 font-extrabold sm:px-6">Card</th>
              <th class="px-4 py-3 font-extrabold">Public link</th>
              <th class="px-4 py-3 font-extrabold">Updated</th>
              <th class="px-4 py-3 font-extrabold text-right sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="card in userCards"
              :key="card.id"
              class="border-t border-gray-800 align-top transition-colors duration-200 hover:bg-gray-900"
            >
              <td class="px-4 py-4 sm:px-6">
                <p class="font-extrabold break-words">
                  {{ card.fullName || 'Untitled card' }}
                </p>
                <p v-if="card.title" class="mt-1 text-sm text-gray-300">
                  {{ card.title }}
                </p>
              </td>
              <td class="px-4 py-4">
                <a
                  :href="card.url"
                  target="_blank"
                  rel="noreferrer"
                  class="block max-w-xl truncate text-sm text-cyan-300 transition-colors duration-200 hover:text-cyan-200"
                >
                  {{ card.url }}
                </a>
              </td>
              <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-400">
                {{ formatDate(card.updatedAt) }}
              </td>
              <td class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-end gap-2">
                  <a
                    :class="actionButtonClass('open')"
                    :href="card.url"
                    target="_blank"
                    rel="noreferrer"
                    title="Open card"
                    aria-label="Open card"
                  >
                    <div
                      class="h-4 w-4"
                      v-html="require(`~/assets/icons/external-link.svg?include`)"
                    ></div>
                  </a>
                  <button
                    type="button"
                    :class="actionButtonClass()"
                    title="Copy card link"
                    aria-label="Copy card link"
                    @click="copyCardLink(card)"
                  >
                    <div
                      class="h-4 w-4"
                      v-html="require(`~/assets/icons/copy.svg?include`)"
                    ></div>
                  </button>
                  <button
                    type="button"
                    :class="actionButtonClass()"
                    title="Edit card"
                    aria-label="Edit card"
                    @click="loadCard(card)"
                  >
                    <div
                      class="h-4 w-4"
                      v-html="require(`~/assets/icons/edit.svg?include`)"
                    ></div>
                  </button>
                  <button
                    type="button"
                    :class="actionButtonClass('danger')"
                    title="Delete card"
                    aria-label="Delete card"
                    @click="deleteCard(card)"
                  >
                    <div
                      class="h-4 w-4"
                      v-html="require(`~/assets/icons/trash.svg?include`)"
                    ></div>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="showPublishSection" class="stepC" :class="showCardsSection ? 'mt-10' : ''">
      <button
        ref="publishCardButton"
        @click="publishCard"
        class="inline-block leading-none text-2xl tracking-wide border-2 border-transparent font-extrabold p-6 rounded select-none transition-colors duration-200 focus:outline-none"
        :title="buttonTitle"
        :class="
          canPublish
            ? 'bg-emerald-600 cursor-pointer text-white focus:bg-emerald-500 hover:bg-emerald-500'
            : 'bg-gray-700 cursor-not-allowed text-black'
        "
      >
        {{ publishBusy ? 'Saving…' : publishLabel }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'publishCard',
    'publishBusy',
    'publishLabel',
    'authUser',
    'userCards',
    'cardsLoading',
    'copyCardLink',
    'loadCard',
    'deleteCard',
    'mode',
  ],
  computed: {
    canPublish() {
      return !this.publishBusy && !!this.authUser
    },
    buttonTitle() {
      if (this.publishBusy) {
        return 'Saving your card'
      }
      if (!this.authUser) {
        return 'Cloudflare authentication is required before saving'
      }
      return ''
    },
    containerClass() {
      if (this.showPublishSection && !this.showCardsSection) {
        return 'mt-16'
      }
      return ''
    },
    showCardsSection() {
      return this.mode !== 'publish'
    },
    showPublishSection() {
      return this.mode !== 'cards'
    },
  },
  methods: {
    formatDate(value) {
      if (!value) {
        return 'just now'
      }
      return new Intl.DateTimeFormat('en-CH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    },
    actionButtonClass(variant = 'neutral') {
      const base =
        'inline-flex h-9 w-9 items-center justify-center rounded border transition-colors duration-200 focus:outline-none'

      if (variant === 'open') {
        return `${base} border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500 focus:bg-emerald-500`
      }

      if (variant === 'danger') {
        return `${base} border-red-700 bg-red-800 text-white hover:bg-red-700 focus:bg-red-700`
      }

      return `${base} border-gray-700 bg-gray-800 text-white hover:bg-gray-700 focus:bg-gray-700`
    },
  },
}
</script>
