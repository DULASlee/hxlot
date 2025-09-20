import { createI18n } from "vue-i18n"
import zhCN from "../locales/zh-CN.json"
import enUS from "../locales/en-US.json"

const STORAGE_KEY = "smartabp.locale"

const getInitialLocale = (): string => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return saved
  // 企业默认策略：首次加载强制中文，除非用户明确切换
  return "zh-CN"
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
})

export const setLocale = (locale: "zh-CN" | "en-US") => {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
}

export default i18n
