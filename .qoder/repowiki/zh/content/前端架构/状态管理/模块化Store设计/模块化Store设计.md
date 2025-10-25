# 模块化Store设计

<cite>
**本文档引用文件**  
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts)
- [权限管理系统低代码配置.json](file://config/权限管理系统低代码配置.json)
</cite>

## 目录
1. [项目结构与模块化Store概述](#项目结构与模块化store概述)
2. [核心模块Store设计](#核心模块store设计)
3. [低代码模块Store实现](#低代码模块store实现)
4. [模块分割原则与状态边界](#模块分割原则与状态边界)
5. [模块依赖关系图](#模块依赖关系图)
6. [状态流示意图](#状态流示意图)

## 项目结构与模块化Store概述

本项目采用模块化状态管理架构，基于Pinia实现。状态管理模块主要分布在`src/SmartAbp.Vue/src/stores/modules`目录下，每个功能模块拥有独立的Store文件，通过命名空间进行隔离。模块化设计遵循单一职责原则，每个Store负责管理特定业务领域的状态和逻辑。

**模块化Store特点**：
- **命名空间隔离**：每个Store通过`defineStore`的name参数实现命名空间隔离
- **类型安全**：使用TypeScript定义完整的接口类型
- **持久化支持**：关键状态支持localStorage持久化
- **计算属性**：通过computed实现派生状态
- **异步操作**：使用async/await处理异步流程

**Section sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)

## 核心模块Store设计

### 用户模块Store

用户模块Store（`user.ts`）负责管理用户实体的CRUD操作和状态。采用标准的Pinia Store模式，包含状态定义、计算属性和Actions。

```mermaid
classDiagram
class UserDto {
+id : string
+name : string
+[key : string] : any
}
class CreateUserDto {
+name : string
+[key : string] : any
}
class UpdateUserDto {
+name? : string
+[key : string] : any
}
class ListQueryParams {
+skipCount? : number
+maxResultCount? : number
+sorting? : string
+filter? : string
+[key : string] : any
}
class ListResponse~T~ {
+items : T[]
+totalCount : number
}
class UserStore {
-list : Ref~UserDto[]~
-total : Ref~number~
-loading : Ref~boolean~
+fetchList(params? : ListQueryParams) : Promise~void~
+createItem(data : CreateUserDto) : Promise~UserDto~
+updateItem(id : string, data : UpdateUserDto) : Promise~UserDto~
+deleteItem(id : string) : Promise~void~
}
UserStore --> UserDto
UserStore --> CreateUserDto
UserStore --> UpdateUserDto
UserStore --> ListQueryParams
UserStore --> ListResponse
```

**Diagram sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts#L30-L197)

### 认证模块Store

认证模块Store（`auth.ts`）负责管理用户认证状态、token和用户信息，支持持久化存储和多标签页同步。

```mermaid
classDiagram
class UserInfo {
+id : string
+userName : string
+email : string
+roles : string[]
+[key : string] : any
}
class LoginCredentials {
+username : string
+password : string
+rememberMe? : boolean
+tenantName? : string
}
class LoginResponse {
+success : boolean
+user : UserInfo
+token : string
+message? : string
}
class AuthStore {
-token : Ref~string | null~
-refreshToken : Ref~string | null~
-userInfo : Ref~UserInfo | null~
-isLoading : Ref~boolean~
+isAuthenticated : ComputedRef~boolean~
+hasRole : ComputedRef~(role : string) => boolean~
+setToken(accessToken : string, refreshTokenValue? : string) : void
+setUserInfo(user : UserInfo) : void
+clearAuth() : void
+getAuthHeader() : Record~string, string~
+login(credentials : LoginCredentials) : Promise~LoginResponse~
+logout() : void
+initialize() : void
+syncFromSmartAbp() : void
}
AuthStore --> UserInfo
AuthStore --> LoginCredentials
AuthStore --> LoginResponse
```

**Diagram sources**
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts#L6-L311)

### 项目模块Store

项目模块Store（`project.ts`）管理项目数据和状态，包含丰富的计算属性和错误处理机制。

```mermaid
classDiagram
class Project {
+id : string
+name : string
+description? : string
+status : ProjectStatus
+priority : ProjectPriority
+createdAt? : Date
+updatedAt? : Date
+[key : string] : any
}
class ProjectsByPriority {
+high : Project[]
+medium : Project[]
+low : Project[]
}
class ProjectStore {
-projects : Ref~Project[]~
-loading : Ref~boolean~
-error : Ref~string | null~
-currentProject : Ref~Project | null~
+activeProjects : ComputedRef~Project[]~
+completedProjects : ComputedRef~Project[]~
+projectsByPriority : ComputedRef~ProjectsByPriority~
+projectCount : ComputedRef~number~
+hasProjects : ComputedRef~boolean~
+fetchProjects() : Promise~void~
+createProject(projectData : Partial~Project~) : Promise~void~
+updateProject(projectData : Partial~Project~) : Promise~void~
+deleteProject(projectId : string) : Promise~void~
+getProjectById(projectId : string) : Project | undefined
+setCurrentProject(project : Project | null) : void
+clearError() : void
}
ProjectStore --> Project
ProjectStore --> ProjectsByPriority
```

**Diagram sources**
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts#L40-L205)

**Section sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)

## 低代码模块Store实现

### 实体建模Store

低代码模块的实体建模Store基于`权限管理系统低代码配置.json`文件实现，该配置文件定义了权限管理系统的实体模型。

```mermaid
erDiagram
MENU {
string Id PK
string Name
string Code
string Title
string ParentId FK
int Type
string Icon
string RoutePath
string ComponentPath
string PermissionCode
bool IsVisible
bool IsEnabled
int Sort
bool IsExternal
string ExternalUrl
}
PERMISSION {
string Id PK
string Name
string DisplayName
string Description
string GroupName
string ParentId FK
int Type
bool IsEnabled
}
ROLE {
string Id PK
string Name
string DisplayName
string Description
int Type
string ParentId FK
bool IsSystem
bool IsEnabled
int Sort
}
DICTIONARY_TYPE {
string Id PK
string Code
string Name
string Description
string Category
bool IsSystem
bool IsActive
int Sort
}
DICTIONARY_ITEM {
string Id PK
string TypeId FK
string Code
string Name
string Value
string Description
string ParentId FK
string Color
bool IsDefault
bool IsActive
int Sort
}
ORGANIZATION {
string Id PK
string Name
string Code
string DisplayName
string Description
string ParentId FK
int Type
int Level
int Sort
string Leader
string Phone
string Email
string Address
bool IsEnabled
}
USER {
string Id PK
string UserName
string Email
string PhoneNumber
string Name
string Surname
string OrganizationId FK
bool IsActive
bool IsLockoutEnabled
string LockoutEnd
int AccessFailedCount
string LastLoginTime
bool IsEmailConfirmed
bool IsPhoneNumberConfirmed
int Gender
string Birthday
string Avatar
}
MENU ||--o{ MENU : "SelfReference"
MENU ||--o{ PERMISSION : "PermissionCode"
ROLE ||--o{ USER : "Roles"
DICTIONARY_TYPE ||--o{ DICTIONARY_ITEM : "Type"
ORGANIZATION ||--o{ USER : "Organization"
ORGANIZATION ||--o{ ORGANIZATION : "SelfReference"
```

**Diagram sources**
- [权限管理系统低代码配置.json](file://config/权限管理系统低代码配置.json#L1-L1080)

### 代码生成Store

低代码项目Store（`projectStore.ts`）负责管理低代码项目的创建、保存、加载和关闭操作。

```mermaid
classDiagram
class LowCodeProject {
+id : string
+name : string
+description : string
+createdAt : number
+updatedAt : number
+entities : Entity[]
+pages : Page[]
+workflows : Workflow[]
}
class Entity {
+name : string
+fields : Field[]
+relations : Relation[]
}
class Page {
+name : string
+components : Component[]
+layout : Layout
}
class Workflow {
+name : string
+steps : Step[]
+triggers : Trigger[]
}
class ProjectStore {
-currentProject : Ref~LowCodeProject | null~
-projects : Ref~Record~string, LowCodeProject~~
+createProject(projectInfo : {name : string, description? : string}) : void
+saveProject() : void
+loadProject(id : string) : LowCodeProject | null
+closeProject() : void
}
ProjectStore --> LowCodeProject
LowCodeProject --> Entity
LowCodeProject --> Page
LowCodeProject --> Workflow
```

**Diagram sources**
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts#L23-L97)

**Section sources**
- [权限管理系统低代码配置.json](file://config/权限管理系统低代码配置.json)
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts)

## 模块分割原则与状态边界

### 模块分割原则

1. **功能单一性原则**：每个Store只负责一个业务领域的状态管理
2. **命名空间隔离原则**：通过唯一的命名空间避免状态冲突
3. **数据所有权原则**：每个数据实体只由一个Store管理
4. **依赖最小化原则**：Store之间通过接口交互，避免直接依赖
5. **可测试性原则**：Store设计便于单元测试和集成测试

### 状态边界定义

```mermaid
flowchart TD
A["全局状态边界"] --> B["用户模块状态"]
A --> C["认证模块状态"]
A --> D["项目模块状态"]
A --> E["低代码模块状态"]
B --> B1["用户列表"]
B --> B2["分页信息"]
B --> B3["加载状态"]
C --> C1["认证Token"]
C --> C2["用户信息"]
C --> C3["加载状态"]
C --> C4["认证状态"]
D --> D1["项目列表"]
D --> D2["当前项目"]
D --> D3["错误信息"]
D --> D4["加载状态"]
E --> E1["当前低代码项目"]
E --> E2["项目集合"]
E --> E3["实体模型"]
E --> E4["页面配置"]
E --> E5["工作流定义"]
style A fill:#f9f,stroke:#333,stroke-width:2px
style B fill:#bbf,stroke:#333,stroke-width:1px
style C fill:#bbf,stroke:#333,stroke-width:1px
style D fill:#bbf,stroke:#333,stroke-width:1px
style E fill:#bbf,stroke:#333,stroke-width:1px
```

**Diagram sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts)

**Section sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts)

## 模块依赖关系图

```mermaid
graph TD
A["认证模块Store"] --> |提供认证信息| B["用户模块Store"]
A --> |提供认证信息| C["项目模块Store"]
A --> |提供认证信息| D["低代码模块Store"]
E["低代码配置"] --> |定义实体模型| D
D --> |生成代码| F["后端服务"]
D --> |生成代码| G["前端页面"]
B --> |管理用户数据| H["用户API服务"]
C --> |管理项目数据| I["项目API服务"]
D --> |管理低代码项目| J["低代码API服务"]
K["UI组件"] --> |读取状态| A
K --> |读取状态| B
K --> |读取状态| C
K --> |读取状态| D
L["路由系统"] --> |根据认证状态| A
style A fill:#f96,stroke:#333,stroke-width:2px
style B fill:#69f,stroke:#333,stroke-width:2px
style C fill:#69f,stroke:#333,stroke-width:2px
style D fill:#69f,stroke:#333,stroke-width:2px
style E fill:#6f9,stroke:#333,stroke-width:2px
style F fill:#9f6,stroke:#333,stroke-width:2px
style G fill:#9f6,stroke:#333,stroke-width:2px
style H fill:#9f6,stroke:#333,stroke-width:2px
style I fill:#9f6,stroke:#333,stroke-width:2px
style J fill:#9f6,stroke:#333,stroke-width:2px
style K fill:#ff6,stroke:#333,stroke-width:2px
style L fill:#ff6,stroke:#333,stroke-width:2px
```

**Diagram sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)
- [projectStore.ts](file://src/SmartAbp.Vue/src/stores/lowcode/projectStore.ts)
- [权限管理系统低代码配置.json](file://config/权限管理系统低代码配置.json)

## 状态流示意图

```mermaid
sequenceDiagram
participant UI as "UI组件"
participant Store as "Pinia Store"
participant API as "API服务"
participant Config as "低代码配置"
UI->>Store : 调用Action (如fetchList)
Store->>Store : 设置loading状态
Store->>API : 发起API请求
API-->>Store : 返回数据
alt 请求成功
Store->>Store : 更新状态 (list, total)
Store->>Store : 设置loading为false
Store-->>UI : 返回成功结果
else 请求失败
Store->>Store : 记录错误信息
Store->>Store : 设置loading为false
Store-->>UI : 抛出错误
end
UI->>Store : 调用createItem
Store->>API : 发起创建请求
API-->>Store : 返回创建结果
Store->>Store : 更新列表状态
Store-->>UI : 返回创建结果
UI->>Store : 调用updateItem
Store->>API : 发起更新请求
API-->>Store : 返回更新结果
Store->>Store : 更新对应项
Store-->>UI : 返回更新结果
UI->>Store : 调用deleteItem
Store->>API : 发起删除请求
API-->>Store : 返回删除结果
Store->>Store : 从列表中移除
Store-->>UI : 返回删除结果
UI->>Store : 访问计算属性
Store->>Store : 计算派生状态
Store-->>UI : 返回计算结果
Config->>Store : 提供实体模型定义
Store->>API : 生成API调用
```

**Diagram sources**
- [user.ts](file://src/SmartAbp.Vue/src/stores/modules/user.ts)
- [auth.ts](file://src/SmartAbp.Vue/src/stores/modules/auth.ts)
- [project.ts](file://src/SmartAbp.Vue/src/stores/modules/project.ts)
- [权限管理系统低代码配置.json](file://config/权限管理系统低代码配置.json)