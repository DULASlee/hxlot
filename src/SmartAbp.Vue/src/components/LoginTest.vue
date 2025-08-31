<template>
  <div class="login-test">
    <h2>登录测试</h2>

    <!-- 测试连接 -->
    <div class="test-section">
      <h3>1. 测试API连接</h3>
      <button @click="testConnection" :disabled="testing">
        {{ testing ? '测试中...' : '测试连接' }}
      </button>
      <div v-if="connectionResult" class="result">
        <strong>连接结果:</strong> {{ connectionResult }}
      </div>
    </div>

    <!-- 简单登录测试 -->
    <div class="test-section">
      <h3>2. 登录测试</h3>
      <form @submit.prevent="testLogin">
        <div>
          <label>租户名称:</label>
          <input v-model="loginData.tenantName" placeholder="留空为主机租户" />
        </div>
        <div>
          <label>用户名:</label>
          <input v-model="loginData.username" placeholder="admin" required />
        </div>
        <div>
          <label>密码:</label>
          <input v-model="loginData.password" type="password" placeholder="1q2w3E*" required />
        </div>
        <button type="submit" :disabled="loginTesting">
          {{ loginTesting ? '登录中...' : '测试登录' }}
        </button>
      </form>
      <div v-if="loginResult" class="result">
        <strong>登录结果:</strong>
        <pre>{{ JSON.stringify(loginResult, null, 2) }}</pre>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error">
      <strong>错误:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const testing = ref(false)
const loginTesting = ref(false)
const connectionResult = ref('')
const loginResult = ref(null)
const error = ref('')

const loginData = ref({
  tenantName: '',
  username: 'admin',
  password: '1q2w3E*'
})

const API_BASE_URL = 'https://localhost:44379'

// 测试API连接
const testConnection = async () => {
  testing.value = true
  error.value = ''
  connectionResult.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/health-status`, {
      method: 'GET',
      mode: 'cors'
    })

    if (response.ok) {
      connectionResult.value = `✅ 连接成功 (${response.status})`
    } else {
      connectionResult.value = `❌ 连接失败 (${response.status})`
    }
  } catch (err: any) {
    connectionResult.value = `❌ 连接错误: ${err.message}`
    error.value = err.message
  } finally {
    testing.value = false
  }
}

// 测试登录
const testLogin = async () => {
  loginTesting.value = true
  error.value = ''
  loginResult.value = null

  try {
    const formData = new URLSearchParams({
      grant_type: 'password',
      username: loginData.value.username,
      password: loginData.value.password,
      client_id: 'SmartAbp_App',
      scope: 'SmartAbp'
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    if (loginData.value.tenantName) {
      headers['__tenant'] = loginData.value.tenantName
    }

    console.log('发送登录请求:', {
      url: `${API_BASE_URL}/connect/token`,
      headers,
      body: formData.toString()
    })

    const response = await fetch(`${API_BASE_URL}/connect/token`, {
      method: 'POST',
      headers,
      body: formData,
      mode: 'cors'
    })

    console.log('登录响应:', response)

    if (response.ok) {
      const data = await response.json()
      loginResult.value = data
      console.log('登录成功:', data)
    } else {
      const errorData = await response.text()
      error.value = `登录失败 (${response.status}): ${errorData}`
      console.error('登录失败:', errorData)
    }
  } catch (err: any) {
    error.value = `登录错误: ${err.message}`
    console.error('登录错误:', err)
  } finally {
    loginTesting.value = false
  }
}
</script>

<style scoped>
.login-test {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

form div {
  margin: 10px 0;
}

label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
}

input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 200px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 3px;
}

.error {
  margin-top: 10px;
  padding: 10px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 3px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
