<template>
  <div class="codegen-entrance">
    <div class="entrance-container">
      <h1 class="main-title">
        选择代码生成模式
      </h1>
      <p class="subtitle">
        根据您的需求选择合适的生成方式
      </p>

      <div class="modes-container">
        <!-- 极简模式 -->
        <div
          class="mode-card simple-mode"
          @click="goToSimpleMode"
        >
          <div class="mode-icon">
            ⚡
          </div>
          <h2 class="mode-title">
            极简模式
          </h2>
          <p class="mode-desc">
            三步快速生成，适合新手和标准CRUD
          </p>
          <ul class="mode-features">
            <li>✅ 5分钟上手</li>
            <li>✅ 选表→配置→生成</li>
            <li>✅ 适合80%场景</li>
            <li>✅ 零学习成本</li>
          </ul>
          <el-button
            type="primary"
            size="large"
            class="mode-btn"
          >
            立即开始
          </el-button>
        </div>

        <!-- 专业模式 -->
        <div
          class="mode-card pro-mode"
          @click="goToProMode"
        >
          <div class="mode-icon">
            🧩
          </div>
          <h2 class="mode-title">
            专业模式
          </h2>
          <p class="mode-desc">
            完整工作台，适合复杂业务和深度定制
          </p>
          <ul class="mode-features">
            <li>✅ 数据建模</li>
            <li>✅ 页面设计</li>
            <li>✅ 工作流编排</li>
            <li>✅ 主题定制</li>
          </ul>
          <el-button
            type="success"
            size="large"
            class="mode-btn"
          >
            进入工作台
          </el-button>
        </div>
      </div>

      <div class="comparison">
        <h3>对比一览</h3>
        <el-table
          :data="comparisonData"
          border
          style="width: 100%"
        >
          <el-table-column
            prop="feature"
            label="特性"
            width="180"
          />
          <el-table-column
            prop="simple"
            label="极简模式"
            align="center"
          />
          <el-table-column
            prop="pro"
            label="专业模式"
            align="center"
          />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSimpleMode = () => {
  router.push('/CodeGen/ultra-simple')
}

const goToProMode = () => {
  router.push('/lowcode')
}

const comparisonData = [
  { feature: '学习成本', simple: '5分钟', pro: '30分钟' },
  { feature: '操作步骤', simple: '3步', pro: '多步骤' },
  { feature: '功能完整度', simple: '80%', pro: '100%' },
  { feature: '适用场景', simple: '标准CRUD', pro: '复杂业务' },
  { feature: '目标用户', simple: '新手/快速需求', pro: '专业开发者' }
]
</script>

<style scoped lang="scss">
.codegen-entrance {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.entrance-container {
  max-width: 1200px;
  width: 100%;
}

.main-title {
  font-size: 48px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 60px;
}

.modes-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-bottom: 60px;
}

.mode-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
}

.mode-icon {
  font-size: 64px;
  text-align: center;
  margin-bottom: 20px;
}

.mode-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #333;
}

.mode-desc {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.mode-features {
  list-style: none;
  padding: 0;
  margin-bottom: 32px;

  li {
    font-size: 16px;
    color: #555;
    margin-bottom: 12px;
    padding-left: 8px;
  }
}

.mode-btn {
  width: 100%;
  font-size: 18px;
  padding: 16px;
  border-radius: 12px;
}

.comparison {
  background: white;
  border-radius: 20px;
  padding: 40px;

  h3 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    text-align: center;
    margin-bottom: 24px;
  }
}

@media (max-width: 768px) {
  .modes-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .main-title {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }
}
</style>

