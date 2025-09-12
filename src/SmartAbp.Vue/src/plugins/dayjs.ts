import dayjs from "dayjs"
import "dayjs/locale/zh-cn"
import relativeTime from "dayjs/plugin/relativeTime"
import localizedFormat from "dayjs/plugin/localizedFormat"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

// 插件扩展
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

// 全局本地化
dayjs.locale("zh-cn")

// 默认时区（可通过环境变量 VITE_TZ 覆盖）
const DEFAULT_TZ = import.meta.env.VITE_TZ || "Asia/Shanghai"
dayjs.tz.setDefault(DEFAULT_TZ)

export default dayjs
