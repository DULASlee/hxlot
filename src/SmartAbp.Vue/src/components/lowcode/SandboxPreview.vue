<template>
  <div class="sandbox-preview">
    <iframe
      ref="iframeRef"
      :srcdoc="htmlContent"
      sandbox="allow-scripts"
      csp="script-src 'self'"
      @load="onIframeLoad"
    >
    </iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

const props = defineProps<{
  code: string
}>()

const iframeRef = ref<HTMLIFrameElement | null>(null)
const htmlContent = ref("")

const updateIframeContent = () => {
  htmlContent.value = `
    <html>
      <head>
        <style>
          /* Basic styles for preview */
          body { font-family: sans-serif; }
        </style>
      </head>
      <body>
        ${props.code}
      </body>
    </html>
  `
}

const onIframeLoad = () => {
  // You can execute code inside the iframe after it loads if needed
  // For example, to inject more complex scripts or styles.
}

watch(() => props.code, updateIframeContent, { immediate: true })
</script>

<style scoped>
.sandbox-preview,
iframe {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
}
</style>
