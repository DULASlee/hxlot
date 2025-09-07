export interface UserInfo {
  id: string
  /** 登录用户名，等同于后端 userName */
  userName: string
  email: string
  roles: string[]
  name?: string
  displayName?: string
  avatar?: string
  tenantId?: string
  tenantName?: string
  tenantDisplayName?: string
  department?: string
  position?: string
}
