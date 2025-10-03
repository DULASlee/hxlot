<template>
  <div class="language-switcher">
    <!-- 语言切换下拉菜单 -->
    <div
      v-click-outside="closeDropdown"
      class="language-switcher-dropdown"
    >
      <button
        class="language-switcher-button"
        :title="currentLanguageName"
        @click="toggleDropdown"
      >
        <i class="fas fa-globe language-icon" />
      </button>

      <div
        v-if="isDropdownOpen"
        class="language-dropdown-menu"
      >
        <!-- 中文选项 -->
        <div
          class="language-dropdown-item"
          :class="{ active: currentLocale === 'zh-CN' }"
          @click="setLanguage('zh-CN')"
        >
          <span class="flag-icon">🇨🇳</span>
          <span class="language-text">简体中文</span>
          <i
            v-if="currentLocale === 'zh-CN'"
            class="fas fa-check check-icon"
          />
        </div>

        <!-- 英文选项 -->
        <div
          class="language-dropdown-item"
          :class="{ active: currentLocale === 'en-US' }"
          @click="setLanguage('en-US')"
        >
          <span class="flag-icon">🇺🇸</span>
          <span class="language-text">English</span>
          <i
            v-if="currentLocale === 'en-US'"
            class="fas fa-check check-icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue"
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/plugins/i18n'
import type { SupportedLocale } from '@/plugins/i18n'
import { ElMessage } from 'element-plus'

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
  name: "LanguageSwitcher",
  directives: {
    "click-outside": vClickOutside,
  },
  setup() {
    const { locale } = useI18n()
    const isDropdownOpen = ref(false)

    // 当前语言
    const currentLocale = computed<SupportedLocale>(() => (locale as any).value)

    // 语言名称映射
    const languageNames: Record<SupportedLocale, string> = {
      'zh-CN': '简体中文',
      'en-US': 'English'
    }

    // 当前语言名称
    const currentLanguageName = computed(() => {
      return languageNames[currentLocale.value] || '简体中文'
    })

    // 切换下拉菜单
    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value
    }

    // 关闭下拉菜单
    const closeDropdown = () => {
      isDropdownOpen.value = false
    }

    // 设置语言
    const setLanguage = (lang: SupportedLocale) => {
      if (lang === currentLocale.value) {
        closeDropdown()
        return
      }

      try {
        setLocale(lang)
        closeDropdown()
        
        // 显示切换成功提示
        const message = lang === 'zh-CN' 
          ? '语言已切换为简体中文'
          : 'Language switched to English'
        
        ElMessage.success({
          message,
          duration: 2000,
          showClose: true
        })

        // 触发自定义事件，通知其他组件
        window.dispatchEvent(
          new CustomEvent("language-changed", {
            detail: { locale: lang },
          }),
        )
      } catch (error) {
        console.error('切换语言失败:', error)
        ElMessage.error('切换语言失败，请刷新页面重试')
      }
    }

    return {
      currentLocale,
      currentLanguageName,
      isDropdownOpen,
      toggleDropdown,
      closeDropdown,
      setLanguage,
    }
  },
})
</script>

<style scoped>
/* 🎨 复用ThemeSwitcher的精美设计风格 */
.language-switcher {
  position: relative;
}

.language-switcher-button {
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

.language-switcher-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgb(255 255 255 / 10%) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.language-switcher-button:hover {
  background: var(--theme-bg-hover);
  color: var(--theme-brand-primary);
  transform: scale(1.05);
}

.language-switcher-button:hover::before {
  transform: translateX(100%);
}

.language-switcher-button:active {
  transform: scale(0.95);
}

.language-icon {
  font-size: 20px;
}

.language-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
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

.language-dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 8px;
  margin: 4px 8px;
  gap: 12px;
}

.language-dropdown-item::before {
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

.language-dropdown-item:hover {
  background: linear-gradient(
    135deg,
    var(--theme-bg-hover) 0%,
    rgba(var(--theme-brand-primary-rgb, 25, 118, 210), 0.05) 100%
  );
  transform: translateX(4px);
}

.language-dropdown-item:hover::before {
  transform: scaleY(1);
}

.language-dropdown-item.active {
  background: linear-gradient(
    135deg,
    var(--theme-brand-primary-alpha, rgb(25 118 210 / 10%)) 0%,
    var(--theme-bg-accent) 100%
  );
  font-weight: 600;
  color: var(--theme-brand-primary);
}

.language-dropdown-item.active::before {
  transform: scaleY(1);
}

.flag-icon {
  font-size: 20px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 10%));
}

.language-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-primary);
  letter-spacing: 0.25px;
}

.check-icon {
  color: var(--theme-brand-primary);
  font-size: 16px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.language-dropdown-item.active .check-icon {
  opacity: 1;
  transform: scale(1);
}

/* 响应式调整 */
@media (width <= 768px) {
  .language-dropdown-menu {
    width: 160px;
    right: -10px;
  }
}

/* 焦点样式（无障碍） */
.language-switcher-button:focus,
.language-dropdown-item:focus {
  outline: 2px solid var(--theme-brand-primary);
  outline-offset: 2px;
}

/* 暗色主题优化 */
[data-theme="dark"] .language-switcher-button {
  background: linear-gradient(135deg, rgb(255 255 255 / 5%) 0%, rgb(255 255 255 / 3%) 100%);
}

[data-theme="dark"] .language-dropdown-menu {
  background: linear-gradient(135deg, rgb(255 255 255 / 8%) 0%, rgb(255 255 255 / 5%) 100%);
}
</style>

