import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'

interface State {
  token?: string
  refreshToken?: string
}

const KEY = '__FeatureName___store'

export const use__FeatureName__Store = defineStore('__FeatureName__', () => {
  const state = reactive<State>({})

  function setToken(token?: string, refreshToken?: string) {
    state.token = token
    state.refreshToken = refreshToken
  }

  function clear() {
    state.token = undefined
    state.refreshToken = undefined
  }

  try {
    const raw = localStorage.getItem(KEY)
    if (raw) Object.assign(state, JSON.parse(raw))
  } catch {}

  watch(state, () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, { deep: true })

  return { state, setToken, clear }
})
