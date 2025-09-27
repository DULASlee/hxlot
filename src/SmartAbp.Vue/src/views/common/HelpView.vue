<template>
  <div class="help-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>帮助中心</span>
        </div>
      </template>
      <div class="help-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>快速入门</template>
              <p>了解SmartAbp的基本使用方法</p>
              <el-button type="primary" text>查看教程</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>代码生成器</template>
              <p>学习如何使用低代码引擎</p>
              <el-button type="primary" text>查看手册</el-button>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>常见问题</template>
              <p>查看常见问题和解决方案</p>
              <el-button type="primary" text>查看FAQ</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 帮助中心页面
</script>

<style scoped>
.help-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-content {
  margin-top: 20px;
}
</style>