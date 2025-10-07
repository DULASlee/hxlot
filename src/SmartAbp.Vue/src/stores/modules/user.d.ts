/**
 * AI_GENERATED_COMPONENT: true
 * Generated at: 2025-09-19T02:08:16.758Z
 * Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理","kebab-case-name":"user"}
 * Based on SmartAbp template library
 * DO NOT EDIT MANUALLY - Regenerate using module wizard
 */
import { type Ref } from 'vue';
/**
 * 用户DTO接口
 */
export interface UserDto {
    id: string;
    name: string;
    [key: string]: any;
}
/**
 * 创建用户DTO接口
 */
export interface CreateUserDto {
    name: string;
    [key: string]: any;
}
/**
 * 更新用户DTO接口
 */
export interface UpdateUserDto {
    name?: string;
    [key: string]: any;
}
/**
 * 列表查询参数接口
 */
export interface ListQueryParams {
    skipCount?: number;
    maxResultCount?: number;
    sorting?: string;
    filter?: string;
    [key: string]: any;
}
/**
 * 列表响应接口
 */
export interface ListResponse<T> {
    items: T[];
    totalCount: number;
}
/**
 * 用户Store
 * 负责管理用户实体的CRUD操作和状态
 */
export declare const useUserStore: import("pinia").StoreDefinition<"user", Pick<{
    list: Ref<UserDto[], UserDto[]>;
    total: Ref<number, number>;
    loading: Ref<boolean, boolean>;
    fetchList: (params?: ListQueryParams) => Promise<void>;
    createItem: (data: CreateUserDto) => Promise<UserDto>;
    updateItem: (id: string, data: UpdateUserDto) => Promise<UserDto>;
    deleteItem: (id: string) => Promise<void>;
}, "loading" | "list" | "total">, Pick<{
    list: Ref<UserDto[], UserDto[]>;
    total: Ref<number, number>;
    loading: Ref<boolean, boolean>;
    fetchList: (params?: ListQueryParams) => Promise<void>;
    createItem: (data: CreateUserDto) => Promise<UserDto>;
    updateItem: (id: string, data: UpdateUserDto) => Promise<UserDto>;
    deleteItem: (id: string) => Promise<void>;
}, never>, Pick<{
    list: Ref<UserDto[], UserDto[]>;
    total: Ref<number, number>;
    loading: Ref<boolean, boolean>;
    fetchList: (params?: ListQueryParams) => Promise<void>;
    createItem: (data: CreateUserDto) => Promise<UserDto>;
    updateItem: (id: string, data: UpdateUserDto) => Promise<UserDto>;
    deleteItem: (id: string) => Promise<void>;
}, "fetchList" | "createItem" | "updateItem" | "deleteItem">>;
//# sourceMappingURL=user.d.ts.map
