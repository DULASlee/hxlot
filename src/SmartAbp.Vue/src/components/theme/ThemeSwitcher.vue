<template>
  <div class="theme-switcher">
    <!-- 主题切换下拉菜单 -->
    <div class="theme-switcher-dropdown" v-click-outside="closeDropdown">
      <button
        class="theme-switcher-button"
        @click="toggleDropdown"
        title="切换主题"
      >
        <i :class="currentThemeIcon" class="theme-icon"></i>
        <span class="theme-name">{{ currentThemeName }}</span>
        <i class="fas fa-chevron-down dropdown-arrow" :class="{ 'rotate-180': isDropdownOpen }"></i>
      </button>

      <div class="theme-dropdown-menu" v-if="isDropdownOpen">
        <!-- 一键暗黑模式切换 -->
        <div class="theme-dropdown-item dark-mode-toggle">
          <span>暗黑模式</span>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="isDarkMode"
              @change="toggleDarkMode"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="theme-dropdown-divider"></div>

        <!-- 主题选择列表 -->
        <div
          v-for="theme in availableThemes"
          :key="theme.value"
          class="theme-dropdown-item"
          :class="{ 'active': currentTheme === theme.value }"
          @click="setTheme(theme.value)"
        >
          <div class="theme-preview" :style="{ backgroundColor: theme.color }"></div>
          <span>{{ theme.name }}</span>
          <i class="fas fa-check" v-if="currentTheme === theme.value"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
// import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores';
// import type { ThemeType } from '@/composables/useDesignSystem';

// 点击外部指令
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};

export default defineComponent({
  name: 'ThemeSwitcher',
  directives: {
    'click-outside': vClickOutside,
  },
  setup() {

    const themeStore = useThemeStore();
    const { currentTheme, isDarkMode } = storeToRefs(themeStore);
    const { setTheme, toggleDarkMode, getAvailableThemes } = themeStore;

    const isDropdownOpen = ref(false);

    // 获取可用主题列表
    const availableThemes = computed(() => getAvailableThemes());

    // 当前主题名称
    const currentThemeName = computed(() => {
      const theme = availableThemes.value.find((t: any) => t.value === currentTheme.value);
      return theme ? theme.name : '科技蓝';
    });

    // 当前主题图标
    const currentThemeIcon = computed(() => {
      const theme = availableThemes.value.find((t: any) => t.value === currentTheme.value);
      return theme ? theme.icon : 'fas fa-microchip';
    });

    // 切换下拉菜单
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    // 关闭下拉菜单
    const closeDropdown = () => {
      isDropdownOpen.value = false;
    };

    // 组件挂载时初始化主题
    onMounted(() => {
      // 如果未设置主题，则设置默认主题为科技蓝
      if (!currentTheme.value) {
        setTheme('tech-blue');
      }
    });

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
    };
  },
});
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

.theme-switcher-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--theme-bg-component) 0%, var(--theme-bg-elevated) 100%);
  border: 1px solid var(--theme-border-light, var(--theme-border-base));
  border-radius: 12px;
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.theme-switcher-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.theme-switcher-button:hover {
  background: linear-gradient(135deg, var(--theme-bg-hover) 0%, var(--theme-bg-component) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--theme-brand-primary);
}

.theme-switcher-button:hover::before {
  transform: translateX(100%);
}

.theme-switcher-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.theme-icon {
  font-size: 18px;
  background: linear-gradient(135deg, var(--theme-brand-primary), var(--theme-brand-primary-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.25px;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.7;
}

.rotate-180 {
  transform: rotate(180deg);
}

.theme-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: linear-gradient(135deg, var(--theme-bg-elevated) 0%, var(--theme-bg-component) 100%);
  border: 1px solid var(--theme-border-light, var(--theme-border-base));
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
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
  content: '';
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
  background: linear-gradient(135deg, var(--theme-bg-hover) 0%, rgba(var(--theme-brand-primary-rgb, 25, 118, 210), 0.05) 100%);
  transform: translateX(4px);
}

.theme-dropdown-item:hover::before {
  transform: scaleY(1);
}

.theme-dropdown-item.active {
  background: linear-gradient(135deg, var(--theme-brand-primary-alpha, rgba(25, 118, 210, 0.1)) 0%, var(--theme-bg-accent) 100%);
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
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.theme-dropdown-item .theme-preview::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
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

/* 暗黑模式开关 */
.dark-mode-toggle {
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 24px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-slider:after {
  content: '☀️';
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--theme-brand-primary) 0%, var(--theme-brand-primary-hover) 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 8px rgba(var(--theme-brand-primary-rgb, 25, 118, 210), 0.3);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider:after {
  content: '🌙';
  left: 6px;
  right: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .theme-name {
    display: none;
  }

  .theme-switcher-button {
    padding: 6px;
  }

  .theme-dropdown-menu {
    width: 180px;
    right: -10px;
  }
}
</style>
