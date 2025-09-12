/**
 * 拖拽式表单开发示例
 * 演示如何使用Vue SFC编译功能进行实时预览
 */

import { createRealtimePreview, createFormBuilder, type FormField } from "../utils/realtime-preview"
import { LowCodeKernel } from "../kernel/core"
import type { PluginContext } from "../kernel/types"

// ============= 拖拽表单开发示例 =============

export async function runDragDropFormExample() {
  console.log("🚀 开始拖拽式表单开发示例")

  // 1. 初始化低代码内核
  const kernel = new LowCodeKernel()
  await kernel.initialize()

  // 创建插件上下文（模拟）
  const mockContext: PluginContext = {
    eventBus: kernel["eventBus"],
    cache: kernel["cache"],
    logger: kernel["logger"],
    monitor: kernel["monitor"],
    config: kernel["config"] as any, // 临时解决类型不匹配
    getPlugin: (name: string) => kernel.getPlugin(name),
    executePlugin: async (name: string, ...args: any[]) => {
      // 模拟实现，实际上LowCodeKernel没有此方法
      console.log(`执行插件: ${name}`, args)
      return {} as any
    },
    createChildContext: (_namespace: string) => mockContext,
  }

  // 2. 创建实时预览管理器
  const previewManager = createRealtimePreview(mockContext, {
    container: "#preview-container", // 假设页面中有这个容器
    hotReload: true,
    debounceTime: 300,
    onError: (error) => {
      console.error("预览错误:", error)
    },
    onUpdate: (instance) => {
      console.log("预览更新成功:", instance)
    },
    onCompiled: (compiled) => {
      console.log("编译成功:", {
        renderSize: compiled.render.length,
        scriptSize: compiled.script.length,
        stylesCount: compiled.styles.length,
      })
    },
  })

  await previewManager.initialize()

  // 3. 创建拖拽表单构建器
  const formBuilder = createFormBuilder()

  // 4. 模拟拖拽添加字段的过程
  console.log("📝 模拟拖拽添加表单字段...")

  // 添加用户名输入框
  formBuilder.addField({
    id: "username",
    type: "input",
    label: "用户名",
    prop: "username",
    required: true,
    placeholder: "请输入用户名",
  })

  // 添加邮箱输入框
  formBuilder.addField({
    id: "email",
    type: "input",
    label: "邮箱地址",
    prop: "email",
    required: true,
    placeholder: "请输入邮箱地址",
  })

  // 添加性别选择
  formBuilder.addField({
    id: "gender",
    type: "select",
    label: "性别",
    prop: "gender",
    placeholder: "请选择性别",
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
      { label: "其他", value: "other" },
    ],
  })

  // 添加个人简介
  formBuilder.addField({
    id: "bio",
    type: "textarea",
    label: "个人简介",
    prop: "bio",
    placeholder: "请输入个人简介",
  })

  // 设置验证规则
  formBuilder.setValidation({
    username: [
      { required: true, message: "请输入用户名", trigger: "blur" },
      { min: 2, max: 20, message: "用户名长度在 2 到 20 个字符", trigger: "blur" },
    ],
    email: [
      { required: true, message: "请输入邮箱地址", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] },
    ],
    gender: [{ required: true, message: "请选择性别", trigger: "change" }],
  })

  // 设置事件处理器
  formBuilder.setHandlers({
    onSubmit: (formData: any) => {
      console.log("表单提交:", formData)
      // 这里可以调用API提交数据
    },
    onReset: () => {
      console.log("表单重置")
    },
    onFieldChange: (field: string, value: any) => {
      console.log(`字段 ${field} 变化:`, value)
      // 这里可以进行实时验证或其他操作
    },
  })

  // 5. 第一次预览更新
  console.log("🎨 生成初始表单预览...")
  const formContext = formBuilder.build()
  await previewManager.updateFormPreview(formContext)

  // 6. 模拟用户拖拽修改表单
  console.log("✏️ 模拟用户编辑表单...")

  setTimeout(async () => {
    console.log("添加新字段：手机号码")
    formBuilder.addField({
      id: "phone",
      type: "input",
      label: "手机号码",
      prop: "phone",
      required: true,
      placeholder: "请输入手机号码",
    })

    const updatedContext = formBuilder.build()
    await previewManager.updateFormPreview(updatedContext)
  }, 2000)

  setTimeout(async () => {
    console.log("修改用户名字段的属性")
    formBuilder.updateField("username", {
      placeholder: "用户名长度2-20个字符",
    })

    const updatedContext = formBuilder.build()
    await previewManager.updateFormPreview(updatedContext)
  }, 4000)

  setTimeout(async () => {
    console.log("删除个人简介字段")
    formBuilder.removeField("bio")

    const updatedContext = formBuilder.build()
    await previewManager.updateFormPreview(updatedContext)
  }, 6000)

  // 7. 模拟清理
  setTimeout(async () => {
    console.log("🧹 清理资源...")
    await previewManager.destroy()
    await kernel.shutdown()
    console.log("✅ 拖拽式表单开发示例完成！")
  }, 8000)

  return {
    kernel,
    previewManager,
    formBuilder,
  }
}

// ============= 性能测试示例 =============

export async function runPerformanceTest() {
  console.log("🚀 开始性能测试")

  const kernel = new LowCodeKernel()
  await kernel.initialize()

  const mockContext: PluginContext = {
    eventBus: kernel["eventBus"],
    cache: kernel["cache"],
    logger: kernel["logger"],
    monitor: kernel["monitor"],
    config: kernel["config"] as any,
    getPlugin: (name: string) => kernel.getPlugin(name),
    executePlugin: async (name: string, ...args: any[]) => {
      console.log(`执行插件: ${name}`, args)
      return {} as any
    },
    createChildContext: (_namespace: string) => mockContext,
  }

  const previewManager = createRealtimePreview(mockContext, {
    container: "#performance-test-container",
    hotReload: true,
    debounceTime: 100, // 更快的响应时间
  })

  await previewManager.initialize()

  // 创建复杂表单进行性能测试
  const formBuilder = createFormBuilder()

  // 添加多个字段
  const fieldTypes: FormField["type"][] = ["input", "select", "textarea", "input", "select"]

  console.time("添加字段耗时")
  for (let i = 0; i < 20; i++) {
    const fieldType = fieldTypes[i % fieldTypes.length]
    formBuilder.addField({
      id: `field_${i}`,
      type: fieldType,
      label: `字段 ${i + 1}`,
      prop: `field${i}`,
      placeholder: `请输入字段 ${i + 1}`,
      ...(fieldType === "select"
        ? {
            options: [
              { label: `选项1`, value: "option1" },
              { label: `选项2`, value: "option2" },
              { label: `选项3`, value: "option3" },
            ],
          }
        : {}),
    })
  }
  console.timeEnd("添加字段耗时")

  // 测试预览生成性能
  console.time("预览生成耗时")
  const formContext = formBuilder.build()
  await previewManager.updateFormPreview(formContext)
  console.timeEnd("预览生成耗时")

  // 测试连续更新性能
  console.log("测试连续更新性能...")
  const updateTimes: number[] = []

  for (let i = 0; i < 5; i++) {
    const startTime = Date.now()

    formBuilder.updateField(`field_${i}`, {
      label: `更新的字段 ${i + 1}`,
      placeholder: `更新的占位符 ${i + 1}`,
    })

    const updatedContext = formBuilder.build()
    await previewManager.updateFormPreview(updatedContext)

    const updateTime = Date.now() - startTime
    updateTimes.push(updateTime)
    console.log(`第${i + 1}次更新耗时: ${updateTime}ms`)

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length
  console.log(`平均更新耗时: ${avgUpdateTime.toFixed(2)}ms`)

  // 获取编译器统计信息
  const stats = previewManager.getStats()
  console.log("编译器统计:", stats)

  // 清理
  await previewManager.destroy()
  await kernel.shutdown()

  console.log("✅ 性能测试完成！")

  return {
    avgUpdateTime,
    updateTimes,
    stats,
  }
}

// ============= 错误处理测试 =============

export async function runErrorHandlingTest() {
  console.log("🚀 开始错误处理测试")

  const kernel = new LowCodeKernel()
  await kernel.initialize()

  const mockContext: PluginContext = {
    eventBus: kernel["eventBus"],
    cache: kernel["cache"],
    logger: kernel["logger"],
    monitor: kernel["monitor"],
    config: kernel["config"] as any,
    getPlugin: (name: string) => kernel.getPlugin(name),
    executePlugin: async (name: string, ...args: any[]) => {
      console.log(`执行插件: ${name}`, args)
      return {} as any
    },
    createChildContext: (_namespace: string) => mockContext,
  }

  const errors: Error[] = []

  const previewManager = createRealtimePreview(mockContext, {
    container: "#error-test-container",
    hotReload: true,
    onError: (error) => {
      errors.push(error)
      console.log("捕获到错误:", error.message)
    },
  })

  await previewManager.initialize()

  // 测试无效字段类型
  const formBuilder = createFormBuilder()

  console.log("测试无效字段配置...")
  formBuilder.addField({
    id: "invalid",
    type: "invalid" as any, // 故意使用无效类型
    label: "无效字段",
    prop: "invalid",
  })

  try {
    const formContext = formBuilder.build()
    await previewManager.updateFormPreview(formContext)
  } catch (error) {
    console.log("预期错误被捕获:", (error as Error).message)
  }

  console.log(`总共捕获 ${errors.length} 个错误`)

  await previewManager.destroy()
  await kernel.shutdown()

  console.log("✅ 错误处理测试完成！")

  return { errors }
}

// 导出测试函数
export default {
  runDragDropFormExample,
  runPerformanceTest,
  runErrorHandlingTest,
}
