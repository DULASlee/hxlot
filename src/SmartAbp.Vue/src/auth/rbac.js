/**
 * RBAC (Role-Based Access Control) 权限系统
 * 基于角色的访问控制模型
 */
/**
 * RBAC服务类
 */
export class RBACService {
    /**
     * 检查用户是否有指定权限
     */
    hasPermission(user, permissionCode) {
        return user.roles.some(role => role.permissions.some(p => p.code === permissionCode));
    }
    /**
     * 检查用户是否有指定角色
     */
    hasRole(user, roleCode) {
        return user.roles.some(role => role.code === roleCode);
    }
    /**
     * 检查用户是否有任一指定权限
     */
    hasAnyPermission(user, permissionCodes) {
        return permissionCodes.some(code => this.hasPermission(user, code));
    }
    /**
     * 检查用户是否有所有指定权限
     */
    hasAllPermissions(user, permissionCodes) {
        return permissionCodes.every(code => this.hasPermission(user, code));
    }
    /**
     * 检查用户是否有任一指定角色
     */
    hasAnyRole(user, roleCodes) {
        return roleCodes.some(code => this.hasRole(user, code));
    }
    /**
     * 检查用户是否有所有指定角色
     */
    hasAllRoles(user, roleCodes) {
        return roleCodes.every(code => this.hasRole(user, code));
    }
    /**
     * 获取用户的所有权限
     */
    getUserPermissions(user) {
        const permissions = [];
        const seen = new Set();
        user.roles.forEach(role => {
            role.permissions.forEach(permission => {
                if (!seen.has(permission.code)) {
                    permissions.push(permission);
                    seen.add(permission.code);
                }
            });
        });
        return permissions;
    }
    /**
     * 获取用户的所有权限编码
     */
    getUserPermissionCodes(user) {
        return this.getUserPermissions(user).map(p => p.code);
    }
    /**
     * 获取用户的所有角色编码
     */
    getUserRoleCodes(user) {
        return user.roles.map(r => r.code);
    }
    /**
     * 检查用户是否有访问资源的权限
     */
    canAccessResource(user, resource, action = 'read') {
        return user.roles.some(role => role.permissions.some(p => p.resource === resource &&
            (p.action === action || p.action === '*')));
    }
    /**
     * 检查用户是否是管理员
     */
    isAdmin(user) {
        return this.hasRole(user, 'admin');
    }
    /**
     * 检查用户是否是超级管理员
     */
    isSuperAdmin(user) {
        return this.hasRole(user, 'superadmin');
    }
    /**
     * 过滤用户有权限的项目列表
     */
    filterByPermission(items, user) {
        return items.filter(item => {
            if (!item.requiredPermission)
                return true;
            return this.hasPermission(user, item.requiredPermission);
        });
    }
    /**
     * 过滤用户有角色的项目列表
     */
    filterByRole(items, user) {
        return items.filter(item => {
            if (!item.requiredRole)
                return true;
            return this.hasRole(user, item.requiredRole);
        });
    }
}
// 导出单例
export const rbacService = new RBACService();
/**
 * 权限检查装饰器（用于方法）
 */
export function RequirePermission(permissionCode) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const user = this.user;
            if (!rbacService.hasPermission(user, permissionCode)) {
                throw new Error(`Permission denied: ${permissionCode}`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
/**
 * 角色检查装饰器（用于方法）
 */
export function RequireRole(roleCode) {
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            const user = this.user;
            if (!rbacService.hasRole(user, roleCode)) {
                throw new Error(`Role required: ${roleCode}`);
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
