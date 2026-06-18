<script setup lang="ts">
import { onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'
import AppLayout from './components/layout/AppLayout.vue'

const uiStore = useUiStore()

onMounted(() => {
  uiStore.initFont()
})
</script>

<template>
  <AppLayout />
</template>
