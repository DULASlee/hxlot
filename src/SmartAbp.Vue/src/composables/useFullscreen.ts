/**
 * 全屏功能组合式函数
 * 提供进入/退出全屏的功能
 */
import { ref, onMounted, onUnmounted } from "vue"

// 扩展HTMLElement类型以支持不同浏览器的全屏API
interface ExtendedHTMLElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
}

// 扩展Document类型以支持不同浏览器的退出全屏API
interface ExtendedDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
  mozCancelFullScreen?: () => Promise<void>
  webkitFullscreenElement?: Element | null
  msFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
}

export function useFullscreen() {
  const isFullscreen = ref(false)
  const fullscreenElement = ref<HTMLElement | null>(null)

  /**
   * 进入全屏模式
   */
  const enterFullscreen = async (element?: HTMLElement) => {
    try {
      const targetElement = (element || fullscreenElement.value || document.documentElement) as ExtendedHTMLElement

      if (targetElement.requestFullscreen) {
        await targetElement.requestFullscreen()
      } else if (targetElement.webkitRequestFullscreen) {
        await targetElement.webkitRequestFullscreen()
      } else if (targetElement.msRequestFullscreen) {
        await targetElement.msRequestFullscreen()
      } else if (targetElement.mozRequestFullScreen) {
        await targetElement.mozRequestFullScreen()
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
      const extendedDocument = document as ExtendedDocument

      if (extendedDocument.exitFullscreen) {
        await extendedDocument.exitFullscreen()
      } else if (extendedDocument.webkitExitFullscreen) {
        await extendedDocument.webkitExitFullscreen()
      } else if (extendedDocument.msExitFullscreen) {
        await extendedDocument.msExitFullscreen()
      } else if (extendedDocument.mozCancelFullScreen) {
        await extendedDocument.mozCancelFullScreen()
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
    const extendedDoc = document as ExtendedDocument
    const fullscreenEl =
      extendedDoc.fullscreenElement ||
      extendedDoc.webkitFullscreenElement ||
      extendedDoc.msFullscreenElement ||
      extendedDoc.mozFullScreenElement

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
