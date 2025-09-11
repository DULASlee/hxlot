<template>
  <section class="__FeatureName__-card">
    <h2>{{ title }}</h2>
    <button class="btn" @click="inc">Clicked {{ count }} times</button>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = '__FeatureName__'
const count = ref(0)
const inc = () => { count.value++ }
</script>

<style scoped>
.__FeatureName__-card {
  padding: var(--spacing-4);
  background: var(--theme-bg-component);
  color: var(--theme-text);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
}
.btn {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  padding: var(--spacing-2) var(--spacing-4);
  border: 0;
  border-radius: var(--radius-sm);
}
</style>
