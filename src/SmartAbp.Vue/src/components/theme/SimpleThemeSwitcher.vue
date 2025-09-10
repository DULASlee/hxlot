<template>
  <div class="theme-switcher">
    <button
      class="theme-button"
      @click="toggleDropdown"
    >
      <span class="theme-icon">🎨</span>
      <span class="theme-text">主题</span>
      <span
        class="dropdown-arrow"
        :class="{ open: showDropdown }"
      >▼</span>
    </button>

    <div
      v-if="showDropdown"
      class="theme-dropdown"
    >
      <div
        v-for="theme in themes"
        :key="theme.key"
        class="theme-option"
        :class="{ active: currentTheme === theme.key }"
        @click="selectTheme(theme.key)"
      >
        <span
          class="theme-color"
          :style="{ backgroundColor: theme.color }"
        />
        <span class="theme-name">{{ theme.name }}</span>
        <span
          v-if="currentTheme === theme.key"
          class="check-mark"
        >✓</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SimpleThemeSwitcher",
  data() {
    return {
      showDropdown: false,
      currentTheme: "classic",
      themes: [
        { key: "classic", name: "经典蓝", color: "#2563eb" },
        { key: "tech", name: "科技绿", color: "#059669" },
        { key: "elegant", name: "优雅紫", color: "#7c3aed" },
        { key: "dark", name: "暗黑", color: "#1f2937" },
      ],
    }
  },
  mounted() {
    // 从localStorage加载保存的主题
    const savedTheme = localStorage.getItem("selectedTheme") || "classic"
    this.currentTheme = savedTheme
    this.applyTheme(savedTheme)

    // 点击外部关闭下拉菜单
    document.addEventListener("click", this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
    },

    selectTheme(themeKey) {
      this.currentTheme = themeKey
      this.applyTheme(themeKey)
      this.showDropdown = false
    },

    applyTheme(theme) {
      const root = document.documentElement

      // 直接设置CSS变量到根元素
      const themeVars = this.getThemeVariables(theme)

      // 清除之前的CSS变量
      Object.keys(themeVars).forEach((key) => {
        root.style.removeProperty(key)
      })

      // 设置新的CSS变量
      Object.entries(themeVars).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })

      // 保存到localStorage
      localStorage.setItem("selectedTheme", theme)

      console.log(`主题已切换到: ${theme}`, themeVars)
    },

    getThemeVariables(theme) {
      const themes = {
        classic: {
          "--primary-color": "#2563eb",
          "--primary-hover": "#1d4ed8",
          "--bg-color": "#ffffff",
          "--text-color": "#1f2937",
          "--border-color": "#e5e7eb",
          "--card-bg": "#ffffff",
          "--hover-bg": "#f3f4f6",
          "--sidebar-bg": "#001529",
          "--sidebar-text": "rgba(255, 255, 255, 0.85)",
          "--sidebar-text-hover": "#ffffff",
          "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
          "--content-bg": "#f5f5f5",
          "--submenu-bg": "#ffffff",
          "--header-bg": "#ffffff",
          "--tab-bg": "#ffffff",
          "--tab-active-bg": "#2563eb",
          "--tab-inactive-bg": "#f8fafc",
          "--tab-hover-bg": "#f1f5f9",
        },
        tech: {
          "--primary-color": "#059669",
          "--primary-hover": "#047857",
          "--bg-color": "#ffffff",
          "--text-color": "#1f2937",
          "--border-color": "#d1d5db",
          "--card-bg": "#ffffff",
          "--hover-bg": "#f0fdf4",
          "--sidebar-bg": "#002329",
          "--sidebar-text": "rgba(255, 255, 255, 0.85)",
          "--sidebar-text-hover": "#ffffff",
          "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
          "--content-bg": "#f6ffed",
          "--submenu-bg": "#ffffff",
          "--header-bg": "#ffffff",
          "--tab-bg": "#ffffff",
          "--tab-active-bg": "#059669",
          "--tab-inactive-bg": "#f0fdf4",
          "--tab-hover-bg": "#ecfdf5",
        },
        elegant: {
          "--primary-color": "#7c3aed",
          "--primary-hover": "#6d28d9",
          "--bg-color": "#ffffff",
          "--text-color": "#1f2937",
          "--border-color": "#e5e7eb",
          "--card-bg": "#ffffff",
          "--hover-bg": "#faf5ff",
          "--sidebar-bg": "#2d1b69",
          "--sidebar-text": "rgba(255, 255, 255, 0.85)",
          "--sidebar-text-hover": "#ffffff",
          "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
          "--content-bg": "#faf5ff",
          "--submenu-bg": "#ffffff",
          "--header-bg": "#ffffff",
          "--tab-bg": "#ffffff",
          "--tab-active-bg": "#7c3aed",
          "--tab-inactive-bg": "#faf5ff",
          "--tab-hover-bg": "#f3e8ff",
        },
        dark: {
          "--primary-color": "#3b82f6",
          "--primary-hover": "#2563eb",
          "--bg-color": "#1a1a2e",
          "--text-color": "#e5e7eb",
          "--border-color": "#374151",
          "--card-bg": "#16213e",
          "--hover-bg": "#1f2937",
          "--sidebar-bg": "#0f1419",
          "--sidebar-text": "rgba(255, 255, 255, 0.85)",
          "--sidebar-text-hover": "#ffffff",
          "--sidebar-hover": "rgba(255, 255, 255, 0.1)",
          "--content-bg": "#1a1a2e",
          "--submenu-bg": "#16213e",
          "--header-bg": "#16213e",
          "--tab-bg": "#16213e",
          "--tab-active-bg": "#3b82f6",
          "--tab-inactive-bg": "#1f2937",
          "--tab-hover-bg": "#374151",
        },
      }

      return themes[theme] || themes.classic
    },

    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showDropdown = false
      }
    },
  },
}
</script>

<style scoped>
.theme-switcher {
  position: relative;
  display: inline-block;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  color: var(--text-color, #1f2937);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.theme-button:hover {
  background: var(--hover-bg, #f3f4f6);
  border-color: var(--primary-color, #2563eb);
}

.theme-icon {
  font-size: 16px;
}

.dropdown-arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 140px;
  overflow: hidden;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-color, #1f2937);
}

.theme-option:hover {
  background: var(--hover-bg, #f3f4f6);
}

.theme-option.active {
  background: var(--primary-color, #2563eb);
  color: white;
}

.theme-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.theme-name {
  flex: 1;
  font-size: 14px;
}

.check-mark {
  font-size: 14px;
  font-weight: bold;
}
</style>
