<template>
  <div class="mt-6 flex flex-col items-start">
    <label :for="`${name}-hex`" class="mb-3 font-medium">{{ label }}</label>
    <div class="flex items-center gap-3">
      <label
        :for="`${name}-picker`"
        class="flex h-12 w-12 cursor-pointer items-center justify-center rounded border border-gray-600 transition-colors duration-200 hover:border-gray-400 focus-within:border-gray-200"
        :style="{ backgroundColor: colors[name].color }"
        :title="`${label}: ${colors[name].color}`"
      >
        <span class="sr-only">{{ label }}</span>
      </label>
      <input
        :id="`${name}-picker`"
        class="sr-only"
        type="color"
        :value="colors[name].color"
        @input="setColour($event.target.value)"
      />
      <input
        :id="`${name}-hex`"
        class="h-12 w-32 rounded border border-transparent bg-black px-4 font-mono uppercase tracking-wider transition-colors duration-200 focus:border-gray-600 focus:outline-none hover:border-gray-600"
        type="text"
        :value="colors[name].color"
        spellcheck="false"
        inputmode="text"
        @input="syncHex($event.target.value)"
        @blur="commitHex($event.target.value)"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: ['name', 'label', 'colors'],
  methods: {
    normalizeHex(value) {
      const cleaned = String(value || '')
        .trim()
        .replace(/[^a-f0-9]/gi, '')
        .slice(0, 6)

      if (cleaned.length === 3 || cleaned.length === 6) {
        return `#${cleaned.toLowerCase()}`
      }

      return null
    },
    setColour(value) {
      const hex = this.normalizeHex(value)
      if (hex) {
        this.colors[this.name].color = hex
      }
    },
    syncHex(value) {
      if (!value) {
        return
      }

      const prefixed = value.startsWith('#') ? value : `#${value}`
      this.colors[this.name].color = prefixed.slice(0, 7)
    },
    commitHex(value) {
      const normalized = this.normalizeHex(value)
      this.colors[this.name].color = normalized || '#000000'
    },
  },
}
</script>
