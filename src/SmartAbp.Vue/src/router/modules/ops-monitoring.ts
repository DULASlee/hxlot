import { RouteRecordRaw } from 'vue-router'

/**
 * 运维监控路由配置
 * 包含性能监控、日志管理、K8s监控、告警管理
 */

// 动态导入运维监控页面组件
const OpsMonitoringLayout = () => import('@/views/ops/OpsMonitoringLayout.vue')
const ApmDashboard = () => import('@/views/ops/ApmDashboard.vue')
const LogsDashboard = () => import('@/views/ops/LogsDashboard.vue')
const K8sDashboard = () => import('@/views/ops/K8sDashboard.vue')
const AlertDashboard = () => import('@/views/ops/AlertDashboard.vue')

const opsMonitoringRoutes: RouteRecordRaw[] = [
  {
    path: '/ops-monitoring',
    name: 'OpsMonitoring',
    component: OpsMonitoringLayout,
    redirect: '/ops-monitoring/apm',
    meta: {
      title: '运维监控',
      icon: 'Monitor',
      requiresAuth: true,
      order: 900, // 显示顺序（较大数字靠后）
    },
    children: [
      {
        path: 'apm',
        name: 'ApmDashboard',
        component: ApmDashboard,
        meta: {
          title: '性能监控',
          icon: 'TrendCharts',
          requiresAuth: true,
        },
      },
      {
        path: 'logs',
        name: 'LogsDashboard',
        component: LogsDashboard,
        meta: {
          title: '日志管理',
          icon: 'Document',
          requiresAuth: true,
        },
      },
      {
        path: 'k8s',
        name: 'K8sDashboard',
        component: K8sDashboard,
        meta: {
          title: 'K8s监控',
          icon: 'Grid',
          requiresAuth: true,
        },
      },
      {
        path: 'alerts',
        name: 'AlertDashboard',
        component: AlertDashboard,
        meta: {
          title: '告警管理',
          icon: 'Bell',
          requiresAuth: true,
        },
      },
    ],
  },
]

export default opsMonitoringRoutes

