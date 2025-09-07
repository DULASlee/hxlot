import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '@/components/auth/LoginForm.vue'
import { nextTick } from 'vue'

describe('LoginForm', () => {
  it('应该正确渲染登录表单', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('应该包含用户名和密码字段', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('输入无效数据时应显示验证错误', async () => {
    const wrapper = mount(LoginForm)

    // 输入空值并触发表单提交
    const submitButton = wrapper.find('button[type="submit"]')
    await submitButton.trigger('click')

    await nextTick()

    // 验证是否显示错误消息
    const errorMessages = wrapper.findAll('.error-message')
    expect(errorMessages.length).toBeGreaterThan(0)
  })
})
