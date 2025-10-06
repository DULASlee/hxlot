/**
 * 🌐 Internationalization Module Entry
 * 
 * 国际化系统入口（专注于验证错误消息）
 * 
 * @module @smartabp/lowcode-shared/i18n
 */

export {
  ValidationMessageKey,
  ZOD_ERROR_TO_MESSAGE_KEY,
  ZOD_STRING_VALIDATION_TO_KEY,
  setValidationI18nConfig,
  getValidationI18nConfig,
  translateValidationMessage,
  getMessageKeyFromZodError,
  extractZodErrorParams,
  type ValidationMessageParams,
  type ValidationI18nConfig,
} from './validation-i18n'
