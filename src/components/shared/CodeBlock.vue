<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps<{
  code: unknown
  lang?: string
}>()

const highlighted = computed(() => {
  const codeStr = typeof props.code === 'string'
    ? props.code
    : JSON.stringify(props.code, null, 2)
  const language = props.lang || 'javascript'
  const result = hljs.highlight(codeStr, { language })
  return result.value
})
</script>

<template>
  <pre class="code-block"><code v-html="highlighted"></code></pre>
</template>

<style scoped>
.code-block {
  background: #F6F8FA;
  border: 1px solid #E8E8E8;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
}

.code-block code {
  font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
}
</style>
