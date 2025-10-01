/**
 * 🔔 更新通知系统
 * SmartAbp低代码引擎 - 第二专题更新通知和安全补丁
 * 
 * 核心功能:
 * - 智能更新通知和提醒
 * - 安全补丁紧急推送
 * - 版本更新日志展示
 * - 用户更新偏好管理
 * - 多渠道通知推送
 */

import { ExtendedVersionInfo, VersionChannel } from './TemplateVersionManager';

export type NotificationType = 'update' | 'security' | 'deprecation' | 'maintenance' | 'feature';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationChannel = 'in-app' | 'email' | 'push' | 'sms' | 'webhook';

/**
 * 通知配置
 */
export interface NotificationConfig {
  /** 用户ID */
  userId: string;
  /** 启用的通知类型 */
  enabledTypes: NotificationType[];
  /** 启用的通知渠道 */
  enabledChannels: NotificationChannel[];
  /** 通知频率 */
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  /** 安静时间 */
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string;   // HH:MM
    timezone: string;
  };
  /** 版本通道偏好 */
  channelPreferences: VersionChannel[];
  /** 自动更新设置 */
  autoUpdate: {
    enabled: boolean;
    securityOnly: boolean;
    excludeBreakingChanges: boolean;
  };
}

/**
 * 通知消息
 */
export interface NotificationMessage {
  /** 消息ID */
  id: string;
  /** 消息类型 */
  type: NotificationType;
  /** 优先级 */
  priority: NotificationPriority;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 富文本内容 */
  richContent?: string;
  /** 相关模版 */
  templateName?: string;
  /** 版本信息 */
  versionInfo?: ExtendedVersionInfo;
  /** 操作按钮 */
  actions: NotificationAction[];
  /** 创建时间 */
  createdAt: number;
  /** 过期时间 */
  expiresAt?: number;
  /** 是否已读 */
  read: boolean;
  /** 是否已处理 */
  handled: boolean;
  /** 元数据 */
  metadata: Record<string, any>;
}

/**
 * 通知操作
 */
export interface NotificationAction {
  /** 操作ID */
  id: string;
  /** 操作标签 */
  label: string;
  /** 操作类型 */
  type: 'primary' | 'secondary' | 'danger' | 'link';
  /** 操作URL */
  url?: string;
  /** 操作处理函数 */
  handler?: () => void | Promise<void>;
  /** 是否自动关闭通知 */
  autoClose: boolean;
}

/**
 * 通知规则
 */
export interface NotificationRule {
  /** 规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 规则描述 */
  description: string;
  /** 匹配条件 */
  conditions: {
    templateNames?: string[];
    versionChannels?: VersionChannel[];
    updateTypes?: NotificationType[];
    priorityLevels?: NotificationPriority[];
    userGroups?: string[];
  };
  /** 通知模板 */
  template: {
    title: string;
    content: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
  };
  /** 是否启用 */
  enabled: boolean;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 通知统计
 */
export interface NotificationStats {
  /** 总通知数 */
  total: number;
  /** 已读数 */
  read: number;
  /** 未读数 */
  unread: number;
  /** 已处理数 */
  handled: number;
  /** 按类型统计 */
  byType: Record<NotificationType, number>;
  /** 按优先级统计 */
  byPriority: Record<NotificationPriority, number>;
  /** 按渠道统计 */
  byChannel: Record<NotificationChannel, number>;
}

/**
 * 🔔 更新通知系统
 */
export class UpdateNotificationSystem {
  private notifications = new Map<string, NotificationMessage>();
  private userConfigs = new Map<string, NotificationConfig>();
  private notificationRules = new Map<string, NotificationRule>();
  private eventListeners = new Map<string, Set<Function>>();

  // 通知渠道处理器
  private channelHandlers = new Map<NotificationChannel, (message: NotificationMessage, config: NotificationConfig) => Promise<boolean>>();

  constructor() {
    this.initializeSystem();
  }

  /**
   * 设置用户通知配置
   */
  setUserConfig(userId: string, config: Partial<NotificationConfig>): void {
    const existingConfig = this.userConfigs.get(userId) || this.getDefaultConfig(userId);
    const updatedConfig = { ...existingConfig, ...config };
    
    this.userConfigs.set(userId, updatedConfig);
    console.log(`⚙️ 更新用户通知配置: ${userId}`);
    
    this.emit('config:updated', { userId, config: updatedConfig });
  }

  /**
   * 获取用户通知配置
   */
  getUserConfig(userId: string): NotificationConfig {
    return this.userConfigs.get(userId) || this.getDefaultConfig(userId);
  }

  /**
   * 发送更新通知
   */
  async sendUpdateNotification(
    templateName: string,
    versionInfo: ExtendedVersionInfo,
    targetUsers?: string[]
  ): Promise<void> {
    const notification: NotificationMessage = {
      id: this.generateNotificationId(),
      type: versionInfo.securityUpdate ? 'security' : 'update',
      priority: versionInfo.securityUpdate ? 'critical' : 'medium',
      title: `${templateName} 有新版本可用`,
      content: `${templateName} 已更新到 v${versionInfo.version}。${versionInfo.releaseNotes}`,
      richContent: this.generateRichContent(templateName, versionInfo),
      templateName,
      versionInfo,
      actions: this.generateUpdateActions(templateName, versionInfo),
      createdAt: Date.now(),
      expiresAt: versionInfo.securityUpdate ? Date.now() + 7 * 24 * 60 * 60 * 1000 : undefined, // 安全更新7天过期
      read: false,
      handled: false,
      metadata: {
        fromVersion: 'current',
        toVersion: versionInfo.version,
        hasBreakingChanges: versionInfo.breakingChanges.length > 0
      }
    };

    // 存储通知
    this.notifications.set(notification.id, notification);

    // 发送给目标用户
    const users = targetUsers || this.getAllUsers();
    for (const userId of users) {
      await this.sendNotificationToUser(notification, userId);
    }

    console.log(`🔔 发送更新通知: ${templateName} v${versionInfo.version} (${users.length} 用户)`);
    this.emit('notification:sent', { notification, users });
  }

  /**
   * 发送安全补丁通知
   */
  async sendSecurityNotification(
    templateName: string,
    versionInfo: ExtendedVersionInfo,
    securityDetails: {
      severity: 'low' | 'medium' | 'high' | 'critical';
      cveIds: string[];
      description: string;
      affectedVersions: string[];
    }
  ): Promise<void> {
    const notification: NotificationMessage = {
      id: this.generateNotificationId(),
      type: 'security',
      priority: 'critical',
      title: `🚨 ${templateName} 安全更新`,
      content: `检测到 ${templateName} 存在安全漏洞，请立即更新到 v${versionInfo.version}。${securityDetails.description}`,
      richContent: this.generateSecurityRichContent(templateName, versionInfo, securityDetails),
      templateName,
      versionInfo,
      actions: [
        {
          id: 'update-now',
          label: '立即更新',
          type: 'danger',
          handler: async () => {
            await this.handleSecurityUpdate(templateName, versionInfo.version);
          },
          autoClose: true
        },
        {
          id: 'view-details',
          label: '查看详情',
          type: 'secondary',
          url: `/security/${templateName}/${versionInfo.version}`,
          autoClose: false
        }
      ],
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
      read: false,
      handled: false,
      metadata: {
        securityDetails,
        urgentUpdate: true
      }
    };

    // 存储通知
    this.notifications.set(notification.id, notification);

    // 发送给所有用户（安全通知优先级最高）
    const users = this.getAllUsers();
    for (const userId of users) {
      await this.sendNotificationToUser(notification, userId);
    }

    console.log(`🚨 发送安全通知: ${templateName} (${securityDetails.severity})`);
    this.emit('security:notification-sent', { notification, securityDetails });
  }

  /**
   * 发送弃用通知
   */
  async sendDeprecationNotification(
    templateName: string,
    currentVersion: string,
    deprecationInfo: {
      deprecatedAt: string;
      endOfLifeDate: string;
      replacementTemplate?: string;
      migrationGuide?: string;
    }
  ): Promise<void> {
    const notification: NotificationMessage = {
      id: this.generateNotificationId(),
      type: 'deprecation',
      priority: 'high',
      title: `⚠️ ${templateName} 即将弃用`,
      content: `${templateName} v${currentVersion} 将于 ${deprecationInfo.endOfLifeDate} 停止支持。${deprecationInfo.replacementTemplate ? `建议迁移到 ${deprecationInfo.replacementTemplate}。` : ''}`,
      templateName,
      actions: this.generateDeprecationActions(templateName, deprecationInfo),
      createdAt: Date.now(),
      read: false,
      handled: false,
      metadata: {
        deprecationInfo,
        currentVersion
      }
    };

    this.notifications.set(notification.id, notification);

    const users = this.getTemplateUsers(templateName);
    for (const userId of users) {
      await this.sendNotificationToUser(notification, userId);
    }

    console.log(`⚠️ 发送弃用通知: ${templateName}`);
    this.emit('deprecation:notification-sent', { notification, deprecationInfo });
  }

  /**
   * 标记通知为已读
   */
  markAsRead(notificationId: string, userId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      console.log(`👁️ 标记通知为已读: ${notificationId} (用户: ${userId})`);
      this.emit('notification:read', { notification, userId });
    }
  }

  /**
   * 标记通知为已处理
   */
  markAsHandled(notificationId: string, userId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.handled = true;
      console.log(`✅ 标记通知为已处理: ${notificationId} (用户: ${userId})`);
      this.emit('notification:handled', { notification, userId });
    }
  }

  /**
   * 获取用户通知
   */
  getUserNotifications(userId: string, options: {
    type?: NotificationType;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): NotificationMessage[] {
    const userConfig = this.getUserConfig(userId);
    let notifications = Array.from(this.notifications.values());

    // 过滤通知类型
    if (options.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }

    // 过滤未读通知
    if (options.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    // 过滤用户启用的类型
    notifications = notifications.filter(n => 
      userConfig.enabledTypes.includes(n.type)
    );

    // 过滤过期通知
    const now = Date.now();
    notifications = notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );

    // 排序（优先级 + 时间）
    notifications.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.createdAt - a.createdAt;
    });

    // 分页
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return notifications.slice(offset, offset + limit);
  }

  /**
   * 获取通知统计
   */
  getNotificationStats(userId?: string): NotificationStats {
    let notifications = Array.from(this.notifications.values());

    if (userId) {
      const userConfig = this.getUserConfig(userId);
      notifications = notifications.filter(n => 
        userConfig.enabledTypes.includes(n.type)
      );
    }

    const stats: NotificationStats = {
      total: notifications.length,
      read: notifications.filter(n => n.read).length,
      unread: notifications.filter(n => !n.read).length,
      handled: notifications.filter(n => n.handled).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
      byChannel: {} as Record<NotificationChannel, number>
    };

    // 按类型统计
    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    // 按优先级统计
    notifications.forEach(n => {
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });

    return stats;
  }

  /**
   * 清理过期通知
   */
  cleanupExpiredNotifications(): void {
    const now = Date.now();
    let cleanedCount = 0;

    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && notification.expiresAt <= now) {
        this.notifications.delete(id);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🗑️ 清理过期通知: ${cleanedCount} 个`);
      this.emit('notifications:cleaned', { count: cleanedCount });
    }
  }

  /**
   * 添加通知规则
   */
  addNotificationRule(rule: NotificationRule): void {
    this.notificationRules.set(rule.id, rule);
    console.log(`📋 添加通知规则: ${rule.name}`);
    this.emit('rule:added', rule);
  }

  /**
   * 注册通知渠道处理器
   */
  registerChannelHandler(
    channel: NotificationChannel,
    handler: (message: NotificationMessage, config: NotificationConfig) => Promise<boolean>
  ): void {
    this.channelHandlers.set(channel, handler);
    console.log(`📡 注册通知渠道处理器: ${channel}`);
  }

  /**
   * 销毁通知系统
   */
  destroy(): void {
    this.notifications.clear();
    this.userConfigs.clear();
    this.notificationRules.clear();
    this.channelHandlers.clear();
    this.eventListeners.clear();
    
    console.log('🗑️ 更新通知系统已销毁');
  }

  // ========== 事件系统 ==========

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`事件处理器错误 [${event}]:`, error);
        }
      });
    }
  }

  // ========== 私有方法 ==========

  /**
   * 初始化系统
   */
  private initializeSystem(): void {
    // 注册默认通知渠道处理器
    this.registerDefaultChannelHandlers();
    
    // 启动清理任务
    this.startCleanupTask();
    
    console.log('🚀 更新通知系统初始化完成');
  }

  /**
   * 注册默认渠道处理器
   */
  private registerDefaultChannelHandlers(): void {
    // 应用内通知
    this.registerChannelHandler('in-app', async (message, _config) => {
      console.log(`📱 应用内通知: ${message.title}`);
      return true;
    });

    // 邮件通知
    this.registerChannelHandler('email', async (message, config) => {
      console.log(`📧 邮件通知: ${message.title} → ${config.userId}`);
      return true;
    });

    // 推送通知
    this.registerChannelHandler('push', async (message, _config) => {
      console.log(`🔔 推送通知: ${message.title}`);
      return true;
    });
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 60 * 60 * 1000); // 每小时清理一次
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(userId: string): NotificationConfig {
    return {
      userId,
      enabledTypes: ['update', 'security', 'deprecation'],
      enabledChannels: ['in-app', 'email'],
      frequency: 'immediate',
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Shanghai'
      },
      channelPreferences: ['stable', 'beta'],
      autoUpdate: {
        enabled: false,
        securityOnly: true,
        excludeBreakingChanges: true
      }
    };
  }

  /**
   * 发送通知给用户
   */
  private async sendNotificationToUser(notification: NotificationMessage, userId: string): Promise<void> {
    const config = this.getUserConfig(userId);
    
    // 检查安静时间
    if (this.isInQuietHours(config)) {
      console.log(`🔇 用户在安静时间，延迟发送: ${userId}`);
      return;
    }

    // 发送到各个渠道
    for (const channel of config.enabledChannels) {
      const handler = this.channelHandlers.get(channel);
      if (handler) {
        try {
          await handler(notification, config);
        } catch (error) {
          console.error(`通知渠道发送失败 [${channel}]:`, error);
        }
      }
    }
  }

  /**
   * 检查是否在安静时间
   */
  private isInQuietHours(config: NotificationConfig): boolean {
    if (!config.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = config.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = config.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 跨天的情况
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * 生成通知ID
   */
  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成富文本内容
   */
  private generateRichContent(templateName: string, versionInfo: ExtendedVersionInfo): string {
    return `
      <div class="update-notification">
        <h3>${templateName} v${versionInfo.version}</h3>
        <p><strong>发布时间:</strong> ${new Date(versionInfo.publishedAt).toLocaleDateString()}</p>
        <p><strong>版本类型:</strong> ${versionInfo.stable ? '稳定版' : '测试版'}</p>
        <div class="release-notes">
          <h4>更新内容:</h4>
          <p>${versionInfo.releaseNotes}</p>
        </div>
        ${versionInfo.breakingChanges.length > 0 ? `
          <div class="breaking-changes">
            <h4>⚠️ 破坏性变更:</h4>
            <ul>
              ${versionInfo.breakingChanges.map(change => `<li>${change}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 生成安全富文本内容
   */
  private generateSecurityRichContent(
    templateName: string,
    versionInfo: ExtendedVersionInfo,
    securityDetails: any
  ): string {
    return `
      <div class="security-notification">
        <h3>🚨 ${templateName} 安全更新</h3>
        <p><strong>严重程度:</strong> <span class="severity-${securityDetails.severity}">${securityDetails.severity.toUpperCase()}</span></p>
        <p><strong>CVE编号:</strong> ${securityDetails.cveIds.join(', ')}</p>
        <p><strong>受影响版本:</strong> ${securityDetails.affectedVersions.join(', ')}</p>
        <div class="security-description">
          <h4>漏洞描述:</h4>
          <p>${securityDetails.description}</p>
        </div>
        <div class="fix-version">
          <h4>修复版本:</h4>
          <p>${templateName} v${versionInfo.version}</p>
        </div>
      </div>
    `;
  }

  /**
   * 生成更新操作
   */
  private generateUpdateActions(templateName: string, versionInfo: ExtendedVersionInfo): NotificationAction[] {
    const actions: NotificationAction[] = [
      {
        id: 'update-now',
        label: '立即更新',
        type: 'primary',
        handler: async () => {
          await this.handleUpdate(templateName, versionInfo.version);
        },
        autoClose: true
      },
      {
        id: 'view-changelog',
        label: '查看更新日志',
        type: 'secondary',
        url: `/changelog/${templateName}/${versionInfo.version}`,
        autoClose: false
      }
    ];

    if (versionInfo.breakingChanges.length > 0) {
      actions.push({
        id: 'migration-guide',
        label: '查看迁移指南',
        type: 'secondary',
        url: `/migration/${templateName}/${versionInfo.version}`,
        autoClose: false
      });
    }

    actions.push({
      id: 'remind-later',
      label: '稍后提醒',
      type: 'link',
      handler: async () => {
        await this.scheduleReminder(templateName, versionInfo.version);
      },
      autoClose: true
    });

    return actions;
  }

  /**
   * 生成弃用操作
   */
  private generateDeprecationActions(templateName: string, deprecationInfo: any): NotificationAction[] {
    const actions: NotificationAction[] = [];

    if (deprecationInfo.replacementTemplate) {
      actions.push({
        id: 'migrate-to-replacement',
        label: `迁移到 ${deprecationInfo.replacementTemplate}`,
        type: 'primary',
        handler: async () => {
          await this.handleMigration(templateName, deprecationInfo.replacementTemplate);
        },
        autoClose: true
      });
    }

    if (deprecationInfo.migrationGuide) {
      actions.push({
        id: 'view-migration-guide',
        label: '查看迁移指南',
        type: 'secondary',
        url: deprecationInfo.migrationGuide,
        autoClose: false
      });
    }

    actions.push({
      id: 'acknowledge',
      label: '我知道了',
      type: 'link',
      handler: async () => {
        // 标记用户已知晓弃用信息
      },
      autoClose: true
    });

    return actions;
  }

  /**
   * 处理更新
   */
  private async handleUpdate(templateName: string, version: string): Promise<void> {
    console.log(`⬆️ 处理更新: ${templateName} → ${version}`);
    // 实际实现需要调用版本管理器的更新方法
  }

  /**
   * 处理安全更新
   */
  private async handleSecurityUpdate(templateName: string, version: string): Promise<void> {
    console.log(`🚨 处理安全更新: ${templateName} → ${version}`);
    // 实际实现需要优先处理安全更新
  }

  /**
   * 处理迁移
   */
  private async handleMigration(fromTemplate: string, toTemplate: string): Promise<void> {
    console.log(`🔄 处理迁移: ${fromTemplate} → ${toTemplate}`);
    // 实际实现需要调用迁移工具
  }

  /**
   * 安排提醒
   */
  private async scheduleReminder(templateName: string, version: string): Promise<void> {
    console.log(`⏰ 安排提醒: ${templateName} v${version}`);
    // 实际实现需要设置定时提醒
  }

  /**
   * 获取所有用户
   */
  private getAllUsers(): string[] {
    return Array.from(this.userConfigs.keys());
  }

  /**
   * 获取模版用户
   */
  private getTemplateUsers(_templateName: string): string[] {
    // 简化实现，实际需要查询使用特定模版的用户
    return this.getAllUsers();
  }
}

/**
 * 工厂函数：创建更新通知系统
 */
export function createUpdateNotificationSystem(): UpdateNotificationSystem {
  return new UpdateNotificationSystem();
}

/**
 * 全局更新通知系统实例
 */
let globalNotificationSystem: UpdateNotificationSystem | null = null;

/**
 * 获取全局更新通知系统
 */
export function getGlobalNotificationSystem(): UpdateNotificationSystem {
  if (!globalNotificationSystem) {
    globalNotificationSystem = new UpdateNotificationSystem();
  }
  return globalNotificationSystem;
}
