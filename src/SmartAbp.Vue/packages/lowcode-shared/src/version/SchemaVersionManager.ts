/**
 * 🔥 Schema版本管理器
 * 
 * 功能:
 * 1. 版本检测与验证
 * 2. 版本兼容性检查
 * 3. 自动降级/升级策略
 * 4. 版本不兼容警告
 * 
 * @version 1.0.0
 * @author SmartAbp架构团队
 * @date 2025-10-06
 */

import { SUPPORTED_SCHEMA_VERSIONS, UNIFIED_SCHEMA_VERSION } from '../types/unified-schema'

/**
 * 版本比较结果
 */
export enum VersionCompareResult {
    /** 版本相同 */
    EQUAL = 0,
    /** 当前版本更新 */
    NEWER = 1,
    /** 当前版本更旧 */
    OLDER = -1,
    /** 版本格式无效 */
    INVALID = -999
}

/**
 * 版本兼容性状态
 */
export enum VersionCompatibility {
    /** 完全兼容 */
    COMPATIBLE = 'compatible',
    /** 需要升级 */
    NEED_UPGRADE = 'need_upgrade',
    /** 需要降级 */
    NEED_DOWNGRADE = 'need_downgrade',
    /** 不兼容 */
    INCOMPATIBLE = 'incompatible',
    /** 未知 */
    UNKNOWN = 'unknown'
}

/**
 * 版本信息
 */
export interface VersionInfo {
    /** 版本号字符串 */
    version: string
    /** 主版本号 */
    major: number
    /** 次版本号 */
    minor: number
    /** 修订号 */
    patch: number
    /** 是否有效 */
    isValid: boolean
}

/**
 * 版本兼容性结果
 */
export interface CompatibilityResult {
    /** 兼容性状态 */
    status: VersionCompatibility
    /** 客户端版本 */
    clientVersion: string
    /** 服务端版本 */
    serverVersion: string
    /** 是否需要操作 */
    needAction: boolean
    /** 建议信息 */
    message: string
    /** 详细说明 */
    details?: string
}

/**
 * Schema版本管理器
 */
export class SchemaVersionManager {
    /** 当前客户端版本 */
    private readonly clientVersion: string = UNIFIED_SCHEMA_VERSION

    /** 版本号正则表达式 */
    private readonly versionRegex = /^(\d+)\.(\d+)\.(\d+)$/

    /**
     * 解析版本号字符串
     * @param version 版本号字符串 (格式: major.minor.patch)
     * @returns 版本信息对象
     */
    parseVersion(version: string): VersionInfo {
        const match = this.versionRegex.exec(version)

        if (!match) {
            return {
                version,
                major: 0,
                minor: 0,
                patch: 0,
                isValid: false
            }
        }

        return {
            version,
            major: parseInt(match[1] || '0', 10),
            minor: parseInt(match[2] || '0', 10),
            patch: parseInt(match[3] || '0', 10),
            isValid: true
        }
    }

    /**
     * 验证版本号格式
     * @param version 版本号字符串
     * @returns 是否有效
     */
    isValidVersion(version: string): boolean {
        return this.versionRegex.test(version)
    }

    /**
     * 比较两个版本号
     * @param version1 版本1
     * @param version2 版本2
     * @returns 比较结果
     */
    compareVersions(version1: string, version2: string): VersionCompareResult {
        const v1 = this.parseVersion(version1)
        const v2 = this.parseVersion(version2)

        if (!v1.isValid || !v2.isValid) {
            return VersionCompareResult.INVALID
        }

        // 比较Major版本
        if (v1.major !== v2.major) {
            return v1.major > v2.major ? VersionCompareResult.NEWER : VersionCompareResult.OLDER
        }

        // 比较Minor版本
        if (v1.minor !== v2.minor) {
            return v1.minor > v2.minor ? VersionCompareResult.NEWER : VersionCompareResult.OLDER
        }

        // 比较Patch版本
        if (v1.patch !== v2.patch) {
            return v1.patch > v2.patch ? VersionCompareResult.NEWER : VersionCompareResult.OLDER
        }

        return VersionCompareResult.EQUAL
    }

    /**
     * 检查版本兼容性
     * @param serverVersion 服务端版本
     * @returns 兼容性结果
     */
    checkCompatibility(serverVersion: string): CompatibilityResult {
        // 验证版本格式
        if (!this.isValidVersion(serverVersion)) {
            return {
                status: VersionCompatibility.UNKNOWN,
                clientVersion: this.clientVersion,
                serverVersion,
                needAction: false,
                message: '服务端版本格式无效',
                details: `期望格式: major.minor.patch (如: 1.0.0), 实际: ${serverVersion}`
            }
        }

        // 比较版本
        const compareResult = this.compareVersions(this.clientVersion, serverVersion)

        switch (compareResult) {
            case VersionCompareResult.EQUAL:
                return {
                    status: VersionCompatibility.COMPATIBLE,
                    clientVersion: this.clientVersion,
                    serverVersion,
                    needAction: false,
                    message: '版本完全匹配',
                    details: '客户端和服务端使用相同的Schema版本,无需任何操作'
                }

            case VersionCompareResult.OLDER:
                // 客户端版本较旧,需要升级
                return this.handleClientOlder(serverVersion)

            case VersionCompareResult.NEWER:
                // 客户端版本较新,需要降级或服务端不支持
                return this.handleClientNewer(serverVersion)

            default:
                return {
                    status: VersionCompatibility.UNKNOWN,
                    clientVersion: this.clientVersion,
                    serverVersion,
                    needAction: false,
                    message: '无法比较版本',
                    details: '版本比较失败,请检查版本格式'
                }
        }
    }

    /**
     * 处理客户端版本较旧的情况
     * @param serverVersion 服务端版本
     * @returns 兼容性结果
     */
    private handleClientOlder(serverVersion: string): CompatibilityResult {
        const clientV = this.parseVersion(this.clientVersion)
        const serverV = this.parseVersion(serverVersion)

        // Major版本不同 → 不兼容
        if (clientV.major !== serverV.major) {
            return {
                status: VersionCompatibility.INCOMPATIBLE,
                clientVersion: this.clientVersion,
                serverVersion,
                needAction: true,
                message: '主版本不兼容,需要升级客户端',
                details: `服务端Schema发生重大变更 (${clientV.major}.x.x → ${serverV.major}.x.x), 必须刷新页面以加载新版本`
            }
        }

        // Minor版本不同 → 需要升级
        if (clientV.minor !== serverV.minor) {
            return {
                status: VersionCompatibility.NEED_UPGRADE,
                clientVersion: this.clientVersion,
                serverVersion,
                needAction: true,
                message: '发现新功能,建议升级',
                details: `服务端提供了新功能 (${clientV.major}.${clientV.minor}.x → ${serverV.major}.${serverV.minor}.x), 刷新页面以使用新特性`
            }
        }

        // Patch版本不同 → 建议升级
        return {
            status: VersionCompatibility.NEED_UPGRADE,
            clientVersion: this.clientVersion,
            serverVersion,
            needAction: false,
            message: '服务端有补丁更新',
            details: `服务端发布了修复补丁 (${this.clientVersion} → ${serverVersion}), 建议刷新页面`
        }
    }

    /**
     * 处理客户端版本较新的情况
     * @param serverVersion 服务端版本
     * @returns 兼容性结果
     */
    private handleClientNewer(serverVersion: string): CompatibilityResult {
        const clientV = this.parseVersion(this.clientVersion)
        const serverV = this.parseVersion(serverVersion)

        // Major版本不同 → 不兼容
        if (clientV.major !== serverV.major) {
            return {
                status: VersionCompatibility.INCOMPATIBLE,
                clientVersion: this.clientVersion,
                serverVersion,
                needAction: true,
                message: '客户端版本过新,服务端不支持',
                details: `客户端使用了服务端不支持的Schema版本 (客户端: ${this.clientVersion}, 服务端: ${serverVersion}), 请联系管理员升级服务端`
            }
        }

        // Minor版本不同 → 警告
        return {
            status: VersionCompatibility.NEED_DOWNGRADE,
            clientVersion: this.clientVersion,
            serverVersion,
            needAction: false,
            message: '客户端版本较新',
            details: `客户端可能使用了服务端不支持的新功能 (客户端: ${this.clientVersion}, 服务端: ${serverVersion}), 部分功能可能不可用`
        }
    }

    /**
     * 检查是否支持指定版本
     * @param version 版本号
     * @returns 是否支持
     */
    isSupportedVersion(version: string): boolean {
        return SUPPORTED_SCHEMA_VERSIONS.includes(version as any)
    }

    /**
     * 获取当前客户端版本
     * @returns 版本号
     */
    getCurrentVersion(): string {
        return this.clientVersion
    }

    /**
     * 获取支持的版本列表
     * @returns 版本号数组
     */
    getSupportedVersions(): readonly string[] {
        return SUPPORTED_SCHEMA_VERSIONS
    }
}

/**
 * 默认版本管理器实例 (单例)
 */
export const versionManager = new SchemaVersionManager()

