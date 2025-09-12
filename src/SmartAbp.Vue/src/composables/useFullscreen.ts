/**
 * 全屏功能组合式函数
 * 提供进入/退出全屏的功能
 */
import { ref, onMounted, onUnmounted } from "vue"

export function useFullscreen() {
  const isFullscreen = ref(false)
  const fullscreenElement = ref<HTMLElement | null>(null)

  /**
   * 进入全屏模式
   */
  const enterFullscreen = async (element?: HTMLElement) => {
    try {
      const targetElement = element || fullscreenElement.value || document.documentElement

      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen()
      } else if ((targetElement as any).webkitRequestFullscreen) {
        await (targetElement as any).webkitRequestFullscreen()
      } else if ((targetElement as any).msRequestFullscreen) {
        await (targetElement as any).msRequestFullscreen()
      } else if ((targetElement as any).mozRequestFullScreen) {
        await (targetElement as any).mozRequestFullScreen()
      }

      isFullscreen.value = true
    } catch (error) {
      console.error("进入全屏失败:", error)
    }
  }

  /**
   * 退出全屏模式
   */
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      }

      isFullscreen.value = false
    } catch (error) {
      console.error("退出全屏失败:", error)
    }
  }

  /**
   * 切换全屏状态
   */
  const toggleFullscreen = async (element?: HTMLElement) => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await enterFullscreen(element)
    }
  }

  /**
   * 监听全屏状态变化
   */
  const handleFullscreenChange = () => {
    const fullscreenEl =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement ||
      (document as any).mozFullScreenElement

    isFullscreen.value = !!fullscreenEl
  }

  /**
   * 设置全屏目标元素
   */
  const setFullscreenElement = (element: HTMLElement) => {
    fullscreenElement.value = element
  }

  // 生命周期钩子
  onMounted(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("msfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange)
    document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.removeEventListener("msfullscreenchange", handleFullscreenChange)
    document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
  })

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    setFullscreenElement,
  }
}
