<script setup lang="ts">
import type { ExtractedParam } from '@/types/compute'

const props = defineProps<{
  text: string
  params: ExtractedParam[]
}>()

const emit = defineEmits<{
  (e: 'param-click', paramName: string): void
}>()

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildHighlightedHtml(): string {
  const sorted = [...props.params]
    .filter((p) => p.position && p.position.start >= 0)
    .sort((a, b) => a.position.start - b.position.start)

  let html = ''
  let cursor = 0

  for (const param of sorted) {
    if (param.position.start > cursor) {
      html += escapeHtml(props.text.slice(cursor, param.position.start))
    }
    const escapedText = escapeHtml(
      props.text.slice(param.position.start, param.position.end)
    )
    const escapedName = escapeHtml(param.name)
    html += `<mark class="hl-extracted" data-param="${escapedName}">${escapedText}</mark>`
    cursor = param.position.end
  }

  if (cursor < props.text.length) {
    html += escapeHtml(props.text.slice(cursor))
  }

  return html
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'MARK') {
    const paramName = target.getAttribute('data-param')
    if (paramName) {
      emit('param-click', paramName)
    }
  }
}
</script>

<template>
  <div class="highlighted-text" v-html="buildHighlightedHtml()" @click="handleClick" />
</template>

<style scoped>
.highlighted-text {
  font-size: 14px;
  line-height: 2;
  color: #303133;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--claude-border);
  border-radius: 6px;
  white-space: pre-wrap;
}
</style>
