<template>
  <div class="theme-switcher">
    <!-- 主题切换下拉菜单 -->
    <div
      v-click-outside="closeDropdown"
      class="theme-switcher-dropdown"
    >
      <button
        class="theme-switcher-button"
        :title="currentThemeName"
        @click="toggleDropdown"
      >
        <i
          :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"
          class="theme-icon"
        />
      </button>

      <div
        v-if="isDropdownOpen"
        class="theme-dropdown-menu"
      >
        <!-- 一键暗黑模式切换 -->
        <div class="theme-dropdown-item dark-mode-toggle">
          <span>暗黑模式</span>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="isDarkMode"
              @change="toggleDarkMode"
            >
            <span class="toggle-slider" />
          </label>
        </div>

        <div class="theme-dropdown-divider" />

        <!-- 主题选择列表（自动匹配图标风格） -->
        <div
          v-for="theme in availableThemes"
          :key="theme.value"
          class="theme-dropdown-item"
          :class="{ active: currentTheme === theme.value }"
          @click="setTheme(theme.value as ThemeType)"
        >
          <div
            class="theme-preview"
            :style="{ backgroundColor: theme.color }"
          />
          <span>{{ theme.name }}</span>
          <i
            v-if="currentTheme === theme.value"
            class="fas fa-check"
          />
        </div>
        
        <!-- 图标风格选择（企业级可用风格） -->
        <div class="theme-dropdown-divider" />
        <div class="theme-dropdown-item icon-style-row">
          <span class="icon-style-label">图标风格</span>
          <el-select
            v-model="selectedIconStyle"
            size="small"
            class="icon-style-select"
            @change="onIconStyleChange"
          >
            <el-option
              v-for="style in iconAvailableStyles"
              :key="style.id"
              :label="style.name"
              :value="style.id"
            />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue"
// import { useI18n } from 'vue-i18n';
import { storeToRefs } from "pinia"
import { useThemeStore, useIconStyleStore } from "@/stores"
import type { ThemeType } from '@/composables/useDesignSystem'
import type { IconStyleType } from '@/stores/modules/iconStyle'

// 点击外部指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener("click", el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener("click", el.clickOutsideEvent)
  },
}

export default defineComponent({
  name: "ThemeSwitcher",
  directives: {
    "click-outside": vClickOutside,
  },
  setup() {
    const themeStore = useThemeStore()
    const { currentTheme, isDarkMode } = storeToRefs(themeStore)
    const { setTheme, toggleDarkMode, getAvailableThemes } = themeStore

    // 图标风格选择
    const iconStore = useIconStyleStore()
    const { currentStyle: iconCurrentStyle, availableStyles: iconAvailableStyles } = storeToRefs(iconStore)
    const selectedIconStyle = ref<IconStyleType>(iconCurrentStyle.value)
    const onIconStyleChange = async (style: IconStyleType) => {
      try {
        await iconStore.setIconStyle(style)
      } catch (e) {
        // 忽略非企业级等保护性错误，回退到原值
        selectedIconStyle.value = iconCurrentStyle.value
      }
    }
    watch(iconCurrentStyle, (v) => { selectedIconStyle.value = v })

    const isDropdownOpen = ref(false)

    // 获取可用主题列表
    const availableThemes = computed(() => getAvailableThemes())

    // 当前主题名称
    const currentThemeName = computed(() => {
      const theme = availableThemes.value.find((t: any) => t.value === currentTheme.value)
      return theme ? theme.name : "科技蓝"
    })

    // 当前主题图标
    const currentThemeIcon = computed(() => {
      const theme = availableThemes.value.find((t: any) => t.value === currentTheme.value)
      return theme ? theme.icon : "fas fa-microchip"
    })

    // 切换下拉菜单
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value
    }

    // 关闭下拉菜单
    const closeDropdown = () => {
      isDropdownOpen.value = false
    }

    // 组件挂载时初始化主题
    onMounted(() => {
      // 如果未设置主题，则设置默认主题为科技蓝
      if (!currentTheme.value) {
        setTheme("tech-blue")
      }
    })

    return {
      currentTheme,
      isDarkMode,
      isDropdownOpen,
      availableThemes,
      currentThemeName,
      currentThemeIcon,
      setTheme,
      toggleDarkMode,
      toggleDropdown,
      closeDropdown,
      getAvailableThemes,
      // 图标风格
      iconAvailableStyles,
      selectedIconStyle,
      onIconStyleChange,
    }
  },
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

.theme-switcher-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: var(--theme-text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.theme-switcher-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgb(255 255 255 / 10%) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.theme-switcher-button:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: scale(1.05);
}

.theme-switcher-button:hover::before {
  transform: translateX(100%);
}

.theme-switcher-button:active {
  transform: scale(0.95);
}

.theme-icon {
  font-size: 20px;
}

.theme-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: linear-gradient(135deg, var(--theme-bg-elevated) 0%, var(--theme-bg-component) 100%);
  border: 1px solid var(--theme-border-light, var(--theme-border-base));
  border-radius: 16px;
  box-shadow:
    0 8px 32px rgb(0 0 0 / 12%),
    0 2px 8px rgb(0 0 0 / 8%);
  z-index: 1000;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transform: translateY(-10px) scale(0.95);
  opacity: 0;
  animation: dropdownEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes dropdownEnter {
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.theme-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 8px;
  margin: 4px 8px;
}

.theme-dropdown-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, var(--theme-brand-primary), var(--theme-brand-primary-hover));
  border-radius: 0 2px 2px 0;
  transform: scaleY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-dropdown-item:hover {
  background: linear-gradient(
    135deg,
    var(--theme-bg-hover) 0%,
    rgba(var(--theme-brand-primary-rgb, 25, 118, 210), 0.05) 100%
  );
  transform: translateX(4px);
}

.theme-dropdown-item:hover::before {
  transform: scaleY(1);
}

.theme-dropdown-item.active {
  background: linear-gradient(
    135deg,
    var(--theme-brand-primary-alpha, rgb(25 118 210 / 10%)) 0%,
    var(--theme-bg-accent) 100%
  );
  font-weight: 600;
  color: var(--theme-brand-primary);
}

.theme-dropdown-item.active::before {
  transform: scaleY(1);
}

.theme-dropdown-item .theme-preview {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  margin-right: 12px;
  border: 2px solid rgb(255 255 255 / 20%);
  box-shadow:
    0 2px 8px rgb(0 0 0 / 15%),
    inset 0 1px 2px rgb(255 255 255 / 20%);
  position: relative;
  overflow: hidden;
}

.theme-dropdown-item .theme-preview::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgb(255 255 255 / 30%), transparent);
}

.theme-dropdown-item span {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-primary);
  letter-spacing: 0.25px;
}

.theme-dropdown-item i {
  color: var(--theme-brand-primary);
  font-size: 16px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-dropdown-item.active i {
  opacity: 1;
  transform: scale(1);
}

.theme-dropdown-divider {
  height: 1px;
  background-color: var(--theme-border-base);
  margin: 8px 0;
}

.icon-style-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
}

.icon-style-label {
  font-size: 13px;
  color: var(--theme-text-secondary);
}

.icon-style-select :deep(.el-input__wrapper) {
  background: var(--theme-bg-component);
}

/* 暗黑模式开关 */
.dark-mode-toggle {
  justify-content: space-between;
  background: linear-gradient(135deg, rgb(255 255 255 / 10%) 0%, rgb(255 255 255 / 5%) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgb(255 255 255 / 10%);
}

.dark-mode-toggle span {
  font-weight: 600;
  font-size: 14px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
  box-shadow: inset 0 2px 4px rgb(0 0 0 / 10%);
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow:
    0 2px 6px rgb(0 0 0 / 20%),
    0 1px 2px rgb(0 0 0 / 10%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-slider::after {
  content: "☀️";
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

input:checked + .toggle-slider {
  background: linear-gradient(
    135deg,
    var(--theme-brand-primary) 0%,
    var(--theme-brand-primary-hover) 100%
  );
  box-shadow:
    inset 0 2px 4px rgb(0 0 0 / 20%),
    0 0 8px rgba(var(--theme-brand-primary-rgb, 25, 118, 210), 0.3);
}

input:checked + .toggle-slider::before {
  transform: translateX(24px);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow:
    0 2px 6px rgb(0 0 0 / 30%),
    0 1px 2px rgb(0 0 0 / 20%);
}

input:checked + .toggle-slider::after {
  content: "🌙";
  left: 6px;
  right: auto;
}

/* 响应式调整 */
@media (width <= 768px) {
  .theme-dropdown-menu {
    width: 180px;
    right: -10px;
  }
}
</style>
