<template>
  <footer class="mt-32 mx-4 flex flex-col">
    <div class="flex flex-col justify-center items-center">
      <div
        class="logo w-12"
        v-html="require(`~/assets/icons/logo.svg?include`)"
      ></div>
      <p class="font-extrabold text-2xl mt-3 leading-tight lowercase">xuno</p>
      <p class="text-xs uppercase tracking-widest text-gray-400 mt-1">
        vCard Generator
      </p>
    </div>
    <p class="mt-6 text-center text-gray-400">
      Made with ❤️ by
      <a
        class="underline text-emerald-600 font-extrabold hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
        href="https://www.vishnuraghav.com/"
        target="_blank"
        rel="noopener noreferrer"
        >Vishnu&nbsp;Raghav</a
      >
    </p>
    <p class="mt-1 mb-8 text-center text-xs text-gray-400">
      <a
        class="underline text-emerald-600 font-extrabold hover:text-emerald-500 focus:text-emerald-500 transition-colors duration-200"
        href="https://github.com/vishnuraghavb/EnBizCard"
        target="_blank"
        rel="noopener noreferrer"
        >View&nbsp;Source</a
      >
      | AGPLv3 License
    </p>
  </footer>
</template>

<script>
export default {}
</script>

<style>
</style>
