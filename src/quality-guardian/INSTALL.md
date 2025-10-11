# Quality Guardian 快速安装指南

## 🚀 方式一：全局安装（推荐）

```bash
cd src/quality-guardian
npm install
npm run build
npm link

# 验证安装
quality-guardian --version
```

## 📦 方式二：本地使用

```bash
cd src/quality-guardian
npm install
npm run build

# 使用
node dist/cli.js check --project-root /path/to/project
```

## 🎯 方式三：项目内集成

在您的项目 `package.json` 添加：

```json
{
  "scripts": {
    "quality": "node ../quality-guardian/dist/cli.js check",
    "quality:strict": "node ../quality-guardian/dist/cli.js check --mode strict"
  }
}
```

## ✅ 验证安装

```bash
# 全局安装后
quality-guardian check --help

# 本地使用
node dist/cli.js check --help
```

## 🔧 开发模式

```bash
cd src/quality-guardian
npm install
npm run dev
```

## 📖 更多文档

详见 [README.md](./README.md)

