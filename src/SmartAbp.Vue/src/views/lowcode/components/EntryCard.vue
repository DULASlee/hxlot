<template>
  <el-card
    class="entry-card"
    :class="{ 'is-hover': isHover }"
    shadow="hover"
    @click="handleClick"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div class="card-content">
      <!-- 图标 -->
      <div class="icon-wrapper" :style="{ backgroundColor: color }">
        <el-icon :size="64" color="#fff">
          <component :is="iconComponent" />
        </el-icon>
      </div>

      <!-- 标题 -->
      <h3 class="card-title">{{ title }}</h3>

      <!-- 描述 -->
      <p class="card-description">{{ description }}</p>

      <!-- 进入按钮 -->
      <el-button
        type="primary"
        :color="color"
        size="large"
        round
        class="enter-button"
      >
        立即进入
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MagicStick, Setting, Tools } from '@element-plus/icons-vue'

interface Props {
  title: string
  description: string
  icon: 'MagicStick' | 'Setting' | 'Tools'
  color: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const isHover = ref(false)

// 图标组件映射
const iconMap = {
  MagicStick,
  Setting,
  Tools
}

const iconComponent = computed(() => iconMap[props.icon])

const handleClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.entry-card {
  height: 280px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  overflow: hidden;

  &:hover {
    border-color: v-bind(color);
  }

  &.is-hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 20px;
  }

  .icon-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    transition: transform 0.3s ease;

    .entry-card.is-hover & {
      transform: scale(1.1);
    }
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 12px 0 8px;
    text-align: center;
    line-height: 1.4;
  }

  .card-description {
    font-size: 14px;
    color: #909399;
    text-align: center;
    flex: 1;
    margin-bottom: 16px;
    line-height: 1.6;
  }

  .enter-button {
    width: 100%;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
}
</style>

