/**
 * 菜单注册中心 - MenuRegistry
 * 统一的动态菜单注册和管理机制
 */
export class MenuRegistry {
    constructor() {
        Object.defineProperty(this, "menus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "menuTree", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // 私有构造函数，确保单例
    }
    /**
     * 获取MenuRegistry单例实例
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new MenuRegistry();
        }
        return this.instance;
    }
    /**
     * 注册单个菜单项
     */
    register(menu) {
        this.menus.set(menu.key, menu);
        this.rebuildTree();
    }
    /**
     * 批量注册菜单
     */
    registerBatch(menus) {
        menus.forEach(menu => {
            this.menus.set(menu.key, menu);
        });
        this.rebuildTree();
    }
    /**
     * 获取指定key的菜单项
     */
    get(key) {
        return this.menus.get(key);
    }
    /**
     * 获取所有菜单项（扁平列表）
     */
    getAll() {
        return Array.from(this.menus.values());
    }
    /**
     * 获取菜单树结构
     */
    getTree() {
        return this.menuTree;
    }
    /**
     * 根据角色过滤菜单
     */
    filterByRoles(roles) {
        const filtered = Array.from(this.menus.values())
            .filter(menu => this.hasPermission(menu, roles))
            .sort((a, b) => a.order - b.order);
        return this.buildTreeFromFlat(filtered);
    }
    /**
     * 根据路径查找菜单项
     */
    findByPath(path) {
        for (const menu of this.menus.values()) {
            if (menu.type === 'page' && 'path' in menu && menu.path === path) {
                return menu;
            }
            if (menu.type === 'folder' && 'children' in menu) {
                const found = this.findInChildren(menu.children, path);
                if (found)
                    return found;
            }
        }
        return null;
    }
    /**
     * 搜索菜单（支持模糊搜索）
     */
    search(keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return Array.from(this.menus.values()).filter(menu => menu.title.toLowerCase().includes(lowerKeyword) ||
            menu.key.toLowerCase().includes(lowerKeyword) ||
            menu.description?.toLowerCase().includes(lowerKeyword));
    }
    /**
     * 移除菜单项
     */
    remove(key) {
        const removed = this.menus.delete(key);
        if (removed) {
            this.rebuildTree();
        }
        return removed;
    }
    /**
     * 清空所有菜单
     */
    clear() {
        this.menus.clear();
        this.menuTree = [];
    }
    /**
     * 检查菜单权限
     */
    hasPermission(menu, userRoles) {
        // 如果菜单不可见，直接返回false
        if (!menu.visible) {
            return false;
        }
        // 如果没有角色要求，所有人都可访问
        if (!menu.requiredRoles || menu.requiredRoles.length === 0) {
            return true;
        }
        // 检查用户是否具有所需角色之一
        return menu.requiredRoles.some(role => userRoles.includes(role));
    }
    /**
     * 在子菜单中查找
     */
    findInChildren(children, path) {
        for (const child of children) {
            if (child.type === 'page' && 'path' in child && child.path === path) {
                return child;
            }
            if (child.type === 'folder' && 'children' in child) {
                const found = this.findInChildren(child.children, path);
                if (found)
                    return found;
            }
        }
        return null;
    }
    /**
     * 重建菜单树结构
     */
    rebuildTree() {
        const allMenus = Array.from(this.menus.values());
        this.menuTree = this.buildTreeFromFlat(allMenus);
    }
    /**
     * 从扁平列表构建树结构
     */
    buildTreeFromFlat(menus) {
        // 按order排序
        const sorted = [...menus].sort((a, b) => a.order - b.order);
        // 根级菜单（没有父级的）
        const roots = sorted.filter(menu => !this.hasParent(menu, sorted));
        // 递归构建子树
        roots.forEach(root => {
            if (root.type === 'folder') {
                const folderRoot = root;
                folderRoot.children = folderRoot.children
                    .filter(child => menus.some(m => m.key === child.key))
                    .sort((a, b) => a.order - b.order);
            }
        });
        return roots;
    }
    /**
     * 检查菜单是否有父级
     */
    hasParent(menu, allMenus) {
        return allMenus.some(m => m.type === 'folder' &&
            'children' in m &&
            m.children?.some(child => child.key === menu.key));
    }
    /**
     * 获取统计信息
     */
    getStats() {
        const all = this.getAll();
        return {
            total: all.length,
            folders: all.filter(m => m.type === 'folder').length,
            pages: all.filter(m => m.type === 'page').length,
            dividers: all.filter(m => m.type === 'divider').length,
            visible: all.filter(m => m.visible).length,
            hidden: all.filter(m => !m.visible).length
        };
    }
}
// 导出单例实例
export const menuRegistry = MenuRegistry.getInstance();
