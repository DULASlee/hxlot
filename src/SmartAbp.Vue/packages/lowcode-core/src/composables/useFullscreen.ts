import { ref, onUnmounted } from 'vue'

export function useFullscreen() {
  const isFullscreen = ref(false)

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      isFullscreen.value = true
    } else {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      isFullscreen.value = false
    }
  }

  onUnmounted(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  })

  return {
    isFullscreen,
    toggleFullscreen,
    exitFullscreen
  }
}
