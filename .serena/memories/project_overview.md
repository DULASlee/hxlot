# SmartAbp 项目概览

## 项目简介
SmartAbp是一个基于ABP框架的企业级全栈应用，包含用户管理、项目管理、日志管理等核心模块。

## 技术栈

### 前端技术栈
- **框架**: Vue 3 + TypeScript + Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **工具库**: VueUse, Axios, Day.js, ECharts
- **测试**: Vitest + Cypress

### 后端技术栈
- **.NET**: .NET Core
- **框架**: ABP Framework
- **ORM**: Entity Framework Core
- **数据库**: SQL Server (推测)

## 项目结构
- `src/SmartAbp.Vue/` - Vue前端应用
- `src/SmartAbp.Domain/` - 域层
- `src/SmartAbp.Application/` - 应用层
- `src/SmartAbp.HttpApi/` - API层
- `src/SmartAbp.Web/` - Web层
- `test/` - 测试项目

## 核心功能模块
- 用户管理 (User Management)
- 项目管理 (Project Management) 
- 日志管理 (Log Management)
- 系统管理 (System Management)
- 认证授权 (Authentication & Authorization)
- 主题系统 (Theme System)