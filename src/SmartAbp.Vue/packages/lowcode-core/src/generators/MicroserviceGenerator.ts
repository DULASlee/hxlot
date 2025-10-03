/**
 * 🔥 微服务架构代码生成器
 * 
 * 功能：
 * 1. 生成微服务模块结构
 * 2. 生成API Gateway配置
 * 3. 生成服务发现配置
 * 4. 生成Docker配置
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

import { getGlobalLogger } from '@smartabp/lowcode-shared'

const logger = getGlobalLogger()

export interface MicroserviceConfig {
  serviceName: string
  port: number
  database: string
  dependencies: string[]
}

/**
 * 微服务代码生成器
 */
export class MicroserviceGenerator {
  /**
   * 生成API Gateway配置
   */
  generateApiGatewayConfig(services: MicroserviceConfig[]): string {
    logger.info('🚀 生成API Gateway配置')

    const routes = services.map(s => `  - Id: ${s.serviceName}Route
    ClusterId: ${s.serviceName}Cluster
    Match:
      Path: /api/${s.serviceName.toLowerCase()}/{**catch-all}
    Transforms:
      - PathPattern: /{**catch-all}`).join('\n')

    const clusters = services.map(s => `  ${s.serviceName}Cluster:
    Destinations:
      ${s.serviceName}Destination:
        Address: http://localhost:${s.port}`).join('\n')

    return `# API Gateway配置
# 生成时间: ${new Date().toISOString()}

Routes:
${routes}

Clusters:
${clusters}`
  }

  /**
   * 生成Docker Compose配置
   */
  generateDockerCompose(services: MicroserviceConfig[]): string {
    logger.info('🚀 生成Docker Compose配置')

    const serviceConfigs = services.map(s => `  ${s.serviceName.toLowerCase()}:
    image: smartabp/${s.serviceName.toLowerCase()}:latest
    container_name: ${s.serviceName.toLowerCase()}
    ports:
      - "${s.port}:80"
    environment:
      - ConnectionStrings__Default=Server=${s.database};Database=${s.serviceName}Db;
    depends_on:
${s.dependencies.map(d => `      - ${d.toLowerCase()}`).join('\n')}
    networks:
      - smartabp-network`).join('\n\n')

    return `# Docker Compose配置
# 生成时间: ${new Date().toISOString()}

version: '3.8'

services:
${serviceConfigs}

networks:
  smartabp-network:
    driver: bridge`
  }

  /**
   * 生成Kubernetes配置
   */
  generateK8sDeployment(config: MicroserviceConfig): string {
    return `# Kubernetes Deployment配置
# 生成时间: ${new Date().toISOString()}

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${config.serviceName.toLowerCase()}
  labels:
    app: ${config.serviceName.toLowerCase()}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${config.serviceName.toLowerCase()}
  template:
    metadata:
      labels:
        app: ${config.serviceName.toLowerCase()}
    spec:
      containers:
      - name: ${config.serviceName.toLowerCase()}
        image: smartabp/${config.serviceName.toLowerCase()}:latest
        ports:
        - containerPort: 80
        env:
        - name: ConnectionStrings__Default
          value: "Server=${config.database};Database=${config.serviceName}Db;"
---
apiVersion: v1
kind: Service
metadata:
  name: ${config.serviceName.toLowerCase()}-service
spec:
  selector:
    app: ${config.serviceName.toLowerCase()}
  ports:
  - protocol: TCP
    port: ${config.port}
    targetPort: 80
  type: LoadBalancer`
  }
}
