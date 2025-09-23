# SmartAbp Enterprise LowCode Engine - Multi-stage Docker Build
FROM node:18-alpine AS frontend-build

# 设置工作目录
WORKDIR /app

# 复制前端依赖文件
COPY src/SmartAbp.Vue/package*.json ./
COPY src/SmartAbp.Vue/pnpm-lock.yaml ./

# 安装依赖 (使用pnpm以提高性能)
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile --production=false

# 复制前端源码
COPY src/SmartAbp.Vue/ ./

# 构建前端应用
RUN pnpm run build

# 后端构建阶段
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build

WORKDIR /src

# 复制解决方案和项目文件
COPY SmartAbp.sln ./
COPY *.props ./
COPY src/ ./src/
COPY test/ ./test/

# 还原依赖
RUN dotnet restore SmartAbp.sln

# 构建解决方案
RUN dotnet build SmartAbp.sln -c Release --no-restore

# 发布Web应用
RUN dotnet publish src/SmartAbp.Web/SmartAbp.Web.csproj \
    -c Release \
    --no-build \
    -o /app/publish

# 生产运行时镜像
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# 设置环境变量
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# 创建应用用户
RUN useradd -m -s /bin/bash smartabp

# 设置工作目录
WORKDIR /app

# 复制发布的应用
COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /app/dist ./wwwroot/

# 复制企业级配置文件
COPY config/ ./config/

# 设置文件权限
RUN chown -R smartabp:smartabp /app

# 切换到应用用户
USER smartabp

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 暴露端口
EXPOSE 80

# 启动应用
ENTRYPOINT ["dotnet", "SmartAbp.Web.dll"]
