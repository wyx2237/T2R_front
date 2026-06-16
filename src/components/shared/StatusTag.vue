<script setup lang="ts">
defineProps<{
  status: 'draft' | 'published'
}>()
</script>

<template>
  <el-tag :type="status === 'published' ? 'success' : 'info'" size="small">
    {{ status === 'published' ? 'Published' : 'Draft' }}
  </el-tag>
</template>
