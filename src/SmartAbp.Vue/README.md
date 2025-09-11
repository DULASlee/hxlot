# smartabp.vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Project Rules

参阅：
- `doc/项目编程规则.md`（统一架构/规则/编码规范/质量门禁与低代码引擎规范）
- `doc/项目开发铁律.md`

## Code Generation

前端代码生成 CLI：

```sh
npm run codegen       # 读取 modules/ 下的 abp.module.json，生成路由/Stores/生命周期/策略聚合
npm run codegen:check # 仅进行冲突检测/清单校验
```
