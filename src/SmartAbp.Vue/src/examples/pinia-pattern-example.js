import { defineStore } from "pinia";
import { reactive, watch } from "vue";
const KEY = "example_store";
export const useExampleStore = defineStore("example", () => {
    const state = reactive({});
    function setToken(token, refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
    }
    function clear() {
        state.token = undefined;
        state.refreshToken = undefined;
    }
    try {
        const raw = localStorage.getItem(KEY);
        if (raw)
            Object.assign(state, JSON.parse(raw));
    }
    catch { }
    watch(state, () => {
        try {
            localStorage.setItem(KEY, JSON.stringify(state));
        }
        catch { }
    }, { deep: true });
    return { state, setToken, clear };
});
