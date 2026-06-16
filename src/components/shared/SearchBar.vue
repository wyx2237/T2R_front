<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputValue = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout>

watch(inputValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    emit('update:modelValue', val)
  }, 300)
})

watch(() => props.modelValue, (val) => {
  inputValue.value = val
})
</script>

<template>
  <el-input
    v-model="inputValue"
    :placeholder="placeholder || 'Search...'"
    clearable
    :prefix-icon="'Search'"
  />
</template>
