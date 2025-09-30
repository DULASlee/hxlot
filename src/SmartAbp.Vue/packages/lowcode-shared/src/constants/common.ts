/**
 * 通用常量
 */

/**
 * 应用名称
 */
export const APP_NAME = 'SmartAbp'

/**
 * 应用版本
 */
export const APP_VERSION = '1.0.0'

/**
 * 默认语言
 */
export const DEFAULT_LOCALE = 'zh-CN'

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const

/**
 * 本地存储键前缀
 */
export const STORAGE_KEY_PREFIX = 'smartabp_'

/**
 * SessionStorage键
 */
export const SESSION_STORAGE_KEYS = {
  TOKEN: `${STORAGE_KEY_PREFIX}token`,
  USER: `${STORAGE_KEY_PREFIX}user`,
  LOCALE: `${STORAGE_KEY_PREFIX}locale`,
  THEME: `${STORAGE_KEY_PREFIX}theme`
} as const

/**
 * LocalStorage键
 */
export const LOCAL_STORAGE_KEYS = {
  PREFERENCES: `${STORAGE_KEY_PREFIX}preferences`,
  CACHE: `${STORAGE_KEY_PREFIX}cache`,
  SETTINGS: `${STORAGE_KEY_PREFIX}settings`
} as const

/**
 * HTTP请求超时时间（毫秒）
 */
export const HTTP_TIMEOUT = 30000

/**
 * API基础路径
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 分页默认配置
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
} as const

/**
 * 日期时间格式
 */
export const DATE_TIME_FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATETIME_SHORT: 'YYYY-MM-DD HH:mm',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY'
} as const

/**
 * 文件上传限制
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const

/**
 * 正则表达式
 */
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^1[3-9]\d{9}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  IP: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  NUMBER: /^-?\d+(\.\d+)?$/,
  INTEGER: /^-?\d+$/,
  POSITIVE_INTEGER: /^[1-9]\d*$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/
} as const

/**
 * 环境变量
 */
export const ENV = {
  PRODUCTION: import.meta.env.PROD,
  DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE
} as const
