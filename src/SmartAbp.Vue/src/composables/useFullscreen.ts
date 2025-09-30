/**
 * 全屏功能组合式函数
 * 提供进入/退出全屏的功能
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * 扩展Document接口以支持浏览器前缀的全屏API
 */
interface DocumentWithFullscreen extends Document {
  webkitFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void>
  msFullscreenElement?: Element
  msExitFullscreen?: () => Promise<void>
  mozFullScreenElement?: Element
  mozCancelFullScreen?: () => Promise<void>
}

/**
 * 扩展HTMLElement接口以支持浏览器前缀的全屏API
 */
interface HTMLElementWithFullscreen extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
  mozRequestFullScreen?: () => Promise<void>
}

/**
 * useFullscreen返回值接口
 */
export interface UseFullscreenReturn {
  /** 是否全屏状态 */
  isFullscreen: Ref<boolean>
  /** 进入全屏 */
  enterFullscreen: (element?: HTMLElement | null) => Promise<void>
  /** 退出全屏 */
  exitFullscreen: () => Promise<void>
  /** 切换全屏状态 */
  toggleFullscreen: (element?: HTMLElement | null) => Promise<void>
  /** 设置全屏目标元素 */
  setFullscreenElement: (element: HTMLElement | null) => void
}

/**
 * 全屏功能Composable
 */
export function useFullscreen(): UseFullscreenReturn {
  const isFullscreen: Ref<boolean> = ref(false)
  const fullscreenElement: Ref<HTMLElement | null> = ref(null)

  /**
   * 进入全屏模式
   */
  const enterFullscreen = async (element?: HTMLElement | null): Promise<void> => {
    try {
      const targetElement = (element ||
        fullscreenElement.value ||
        document.documentElement) as HTMLElementWithFullscreen

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
      console.error('进入全屏失败:', error)
    }
  }

  /**
   * 退出全屏模式
   */
  const exitFullscreen = async (): Promise<void> => {
    try {
      const doc = document as DocumentWithFullscreen

      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen()
      }

      isFullscreen.value = false
    } catch (error) {
      console.error('退出全屏失败:', error)
    }
  }

  /**
   * 切换全屏状态
   */
  const toggleFullscreen = async (element?: HTMLElement | null): Promise<void> => {
    if (isFullscreen.value) {
      await exitFullscreen()
    } else {
      await enterFullscreen(element)
    }
  }

  /**
   * 监听全屏状态变化
   */
  const handleFullscreenChange = (): void => {
    const doc = document as DocumentWithFullscreen
    const fullscreenEl =
      document.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement ||
      doc.mozFullScreenElement

    isFullscreen.value = !!fullscreenEl
  }

  /**
   * 设置全屏目标元素
   */
  const setFullscreenElement = (element: HTMLElement | null): void => {
    fullscreenElement.value = element
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 生命周期钩子
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  })

  onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  })

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    setFullscreenElement
  }
}