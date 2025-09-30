import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.json'
import enUS from '../locales/en-US.json'

/**
 * 本地存储键
 */
const STORAGE_KEY = 'smartabp.locale'

/**
 * 支持的语言类型
 */
export type SupportedLocale = 'zh-CN' | 'en-US'

/**
 * 消息类型
 */
export type MessageSchema = typeof zhCN

/**
 * 获取初始语言
 */
const getInitialLocale = (): SupportedLocale => {
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null
  if (saved) return saved

  // 企业默认策略：首次加载强制中文，除非用户明确切换
  return 'zh-CN'
}

/**
 * i18n实例
 */
export const i18n = createI18n<{ 'zh-CN': MessageSchema; 'en-US': MessageSchema }, SupportedLocale>(
  {
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS
    }
  }
)

/**
 * 设置语言
 */
export const setLocale = (locale: SupportedLocale): void => {
  ;(i18n.global.locale as any).value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}

export default i18n