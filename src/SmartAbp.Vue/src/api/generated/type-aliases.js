/**
 * 🔥 后端SSOT类型别名（Phase 2B + Phase 3扩展）
 * 用途：简化api-client.ts生成的冗长类型名
 * 架构决策：100%映射后端类型，不创建新定义
 */
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 枚举类型（手动补充，因为swagger-typescript-api生成为数字字面量）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * 导航关系类型枚举
 */
export var NavigationRelationType;
(function (NavigationRelationType) {
    /** 一对一（如：User ←→ UserProfile） */
    NavigationRelationType[NavigationRelationType["OneToOne"] = 0] = "OneToOne";
    /** 一对多（如：Customer → Orders） */
    NavigationRelationType[NavigationRelationType["OneToMany"] = 1] = "OneToMany";
    /** 多对一（如：Order → Customer） */
    NavigationRelationType[NavigationRelationType["ManyToOne"] = 2] = "ManyToOne";
    /** 多对多（如：Product ←→ Category） */
    NavigationRelationType[NavigationRelationType["ManyToMany"] = 3] = "ManyToMany";
})(NavigationRelationType || (NavigationRelationType = {}));
/**
 * 级联删除行为枚举
 */
export var CascadeDeleteBehavior;
(function (CascadeDeleteBehavior) {
    /** 无操作 */
    CascadeDeleteBehavior[CascadeDeleteBehavior["None"] = 0] = "None";
    /** 级联删除（删除主实体时自动删除关联实体） */
    CascadeDeleteBehavior[CascadeDeleteBehavior["Cascade"] = 1] = "Cascade";
    /** 设置为NULL（删除主实体时将外键设为NULL） */
    CascadeDeleteBehavior[CascadeDeleteBehavior["SetNull"] = 2] = "SetNull";
    /** 限制删除（存在关联时禁止删除主实体） */
    CascadeDeleteBehavior[CascadeDeleteBehavior["Restrict"] = 3] = "Restrict";
})(CascadeDeleteBehavior || (CascadeDeleteBehavior = {}));
/**
 * @deprecated 已废弃（Phase 3B后端SSOT迁移）
 * 无对应替代类型，ValidationRule不再需要ruleType枚举
 */
// export type UnifiedValidationRuleType = import('@smartabp/lowcode-shared').ValidationRuleType
//# sourceMappingURL=type-aliases.js.map