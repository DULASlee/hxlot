// 主题功能测试脚本
console.log("=== 主题功能测试 ===")

// 模拟主题存储功能
function testThemeStore() {
  console.log("1. 测试主题存储功能")

  // 模拟 localStorage
  const mockLocalStorage = {
    getItem: (key) => {
      if (key === "smartabp_theme") return "light"
      return null
    },
    setItem: (key, value) => {
      console.log(`设置主题: ${key} = ${value}`)
    },
  }

  // 模拟主题应用
  function applyTheme(theme) {
    console.log(`应用主题: ${theme}`)
    const root = document.documentElement
    root.classList.remove("light", "dark", "tech")
    root.classList.add(theme)
    root.setAttribute("data-theme", theme)
    console.log("HTML 元素类:", root.className)
    console.log("data-theme 属性:", root.getAttribute("data-theme"))
  }

  // 测试主题切换
  console.log("2. 测试主题切换")
  applyTheme("light")
  applyTheme("dark")
  applyTheme("tech")

  console.log("3. 测试主题存储")
  mockLocalStorage.setItem("smartabp_theme", "dark")

  console.log("✅ 主题功能测试完成")
}

// 执行测试
testThemeStore()
