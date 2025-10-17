<template>
  <div class="product-form">
    <h2>{{ props.name }}</h2>
    <p>价格: {{ props.price }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 }
}>()

// 手动添加的业务逻辑（不应被覆盖）
const handleSubmit = () => {
  console.log('提交表单', props)
}
</script>

<style scoped>
.product-form {
  padding: 20px;
}
</style>

