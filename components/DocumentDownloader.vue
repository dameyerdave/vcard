<template>
  <div class="mediaC">
    <div>
      <img
        :src="
          PreviewMode
            ? media.coverDataURI
            : `./media/${getTitle(media.title)}.${media.coverExt}`
        "
        :alt="media.title"
      />
    </div>
    <div class="controls cardColor">
      <p class="title">
        {{ media.title }}
      </p>
      <div class="docDl">
        <p class="fileSize sub">PDF - {{ media.filesize }}</p>
        <a
          class="dlBtn"
          @click.prevent="downloadDocument()"
          :style="{
            backgroundColor: `${colors.buttonBg.color}`,
          }"
          :href="
            PreviewMode ? '' : `./media/${getTitle(media.title)}.${media.ext}`
          "
          download
          target="_blank"
        >
          <div
            class="icon iconColor"
            v-html="require(`~/assets/icons/download.svg?include`)"
          ></div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { downloadBlob, downloadDataUrl } from '@/utils/download'
export default {
  props: ['media', 'type', 'colors', 'PreviewMode'],
  methods: {
    getTitle(e) {
      return e.toLowerCase().split(' ').join('_')
    },
    downloadDocument() {
      if (this.media.file) {
        downloadBlob(this.media.file, `${this.media.title}.pdf`)
        return
      }

      if (this.media.dataURI) {
        downloadDataUrl(this.media.dataURI, `${this.media.title}.pdf`)
      }
    },
  },
}
</script>
