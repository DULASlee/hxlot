<template>
  <div class="realtime-monitor-panel">
    <el-alert 
      type="info" 
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
      <template #title>
        实时监控功能正在开发中...
      </template>
      此面板将实时显示系统性能指标变化，包括内存使用、CPU占用、网络请求等
    </el-alert>

    <el-row :gutter="20">
      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="metric-header">
              <i class="fas fa-memory" />
              <span>内存使用</span>
            </div>
          </template>
          <div class="metric-placeholder">
            <div class="placeholder-icon">
              <i class="fas fa-chart-line" />
            </div>
            <div class="placeholder-text">
              实时内存监控图表
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="metric-header">
              <i class="fas fa-microchip" />
              <span>CPU占用</span>
            </div>
          </template>
          <div class="metric-placeholder">
            <div class="placeholder-icon">
              <i class="fas fa-chart-area" />
            </div>
            <div class="placeholder-text">
              实时CPU监控图表
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :md="8"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="metric-header">
              <i class="fas fa-network-wired" />
              <span>网络请求</span>
            </div>
          </template>
          <div class="metric-placeholder">
            <div class="placeholder-icon">
              <i class="fas fa-chart-bar" />
            </div>
            <div class="placeholder-text">
              实时网络监控图表
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// 实时监控面板 - 待实现
</script>

<style scoped lang="scss">
.realtime-monitor-panel {
  .metric-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;

    i {
      color: #409EFF;
    }
  }

  .metric-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    min-height: 200px;

    .placeholder-icon {
      font-size: 48px;
      color: #DCDFE6;
      margin-bottom: 16px;
    }

    .placeholder-text {
      font-size: 14px;
      color: #909399;
    }
  }
}
</style>
