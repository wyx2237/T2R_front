<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTools } from '@/api/tools'
import type { AtomicTool } from '@/types/tool'
import CodeBlock from '@/components/shared/CodeBlock.vue'
import { toolAccentColor } from '@/composables/useToolColor'
import { InfoFilled, SetUp, Collection } from '@element-plus/icons-vue'

const tools = ref<AtomicTool[]>([])
const loading = ref(false)
const expandedIds = ref<Set<string>>(new Set())

function toggleExpand(toolId: string) {
  const next = new Set(expandedIds.value)
  if (next.has(toolId)) {
    next.delete(toolId)
  } else {
    next.add(toolId)
  }
  expandedIds.value = next
}

onMounted(async () => {
  loading.value = true
  try {
    tools.value = await getTools()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="tool-library-page" v-loading="loading">
    <div class="page-header">
      <h2>Tool Template Library</h2>
      <span class="template-count">{{ tools.length }} templates</span>
    </div>

    <TransitionGroup name="card-list" tag="div" class="cards-container">
      <el-card
        v-for="(tool, index) in tools"
        :key="tool.id"
        class="tool-card"
        :class="{ expanded: expandedIds.has(tool.id) }"
        shadow="hover"
        :style="{ borderLeftColor: toolAccentColor(tool.id) }"
        @click="toggleExpand(tool.id)"
      >
        <!-- Collapsed preview -->
        <div class="card-preview">
          <div class="preview-header">
            <span class="tool-name">{{ tool.MetaInfo.Name }}</span>
            <span class="expand-hint">
              {{ expandedIds.has(tool.id) ? '▲ Collapse' : '▼ Expand' }}
            </span>
          </div>
          <p class="tool-full-desc">{{ tool.MetaInfo.Description }}</p>
          <div class="meta-rows">
            <div class="meta-row">
              <span class="meta-tag">Scope</span>
              <span class="meta-text">{{ tool.MetaInfo.Scope }}</span>
            </div>
            <div class="meta-row meta-row-split">
              <div class="meta-half">
                <span class="meta-tag">Language</span>
                <el-tag size="small" type="info" effect="plain">{{ tool.ExecInfo.Language }}</el-tag>
              </div>
              <div class="meta-half">
                <span class="meta-tag">Libraries</span>
                <template v-if="tool.ExecInfo.Library.length > 0">
                  <el-tag
                    v-for="lib in tool.ExecInfo.Library"
                    :key="lib"
                    size="small"
                    type="info"
                    effect="plain"
                    style="margin-right: 4px"
                  >
                    {{ lib }}
                  </el-tag>
                </template>
                <span v-else class="no-libs">—</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expanded detail (stop click propagation so inner clicks don't collapse) -->
        <div v-if="expandedIds.has(tool.id)" class="card-detail" @click.stop>
          <el-divider />

          <!-- FlowInfo -->
          <div class="detail-section">
            <div class="section-badge badge-flow">
              <el-icon><InfoFilled /></el-icon>
              <span>FlowInfo</span>
            </div>
            <div class="flow-grid">
              <div class="flow-item">
                <h5>Input</h5>
                <p>{{ tool.FlowInfo.Input.Description }}</p>
                <CodeBlock :code="tool.FlowInfo.Input.Example" lang="json" />
              </div>
              <div class="flow-item">
                <h5>Output</h5>
                <p>{{ tool.FlowInfo.Output.Description }}</p>
                <CodeBlock :code="tool.FlowInfo.Output.Example" lang="json" />
              </div>
            </div>
          </div>

          <!-- ExecInfo Logic -->
          <el-divider />
          <div class="detail-section">
            <div class="section-badge badge-exec">
              <el-icon><SetUp /></el-icon>
              <span>Execution Logic</span>
            </div>
            <ol class="logic-steps">
              <li v-for="(step, i) in tool.ExecInfo.Logic" :key="i">
                {{ step }}
              </li>
            </ol>
          </div>

          <!-- Examples -->
          <el-divider />
          <div class="detail-section">
            <div class="section-badge badge-examples">
              <el-icon><Collection /></el-icon>
              <span>Examples ({{ tool.Examples.length }})</span>
            </div>
            <div
              v-for="(ex, i) in tool.Examples"
              :key="i"
              class="example-item"
            >
              <h5 class="example-name">{{ ex.ToolName }}</h5>
              <div class="example-inline">
                <span class="example-label">Parameters</span>
                <code class="inline-params">{{ JSON.stringify(ex.Parameters) }}</code>
              </div>
              <div class="example-inline">
                <span class="example-label">Output</span>
                <code class="inline-params">{{ JSON.stringify(ex.Output) }}</code>
              </div>
              <div class="example-block">
                <span class="example-label">Code</span>
                <CodeBlock :code="ex.Code" lang="python" />
              </div>
              <el-divider v-if="i < tool.Examples.length - 1" />
            </div>
          </div>
        </div>
      </el-card>
    </TransitionGroup>

    <el-empty
      v-if="tools.length === 0 && !loading"
      description="No tool templates found"
    />
  </div>
</template>

<style scoped>
.tool-library-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.template-count {
  font-size: 14px;
  color: #909399;
}

/* Cards */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-card {
  border-left: 5px solid #409EFF;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.25s, transform 0.25s;
}

.tool-card:hover {
  transform: translateY(-2px);
}

.tool-card :deep(.el-card__body) {
  padding: 20px 24px;
}

/* Collapsed preview */
.card-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-name {
  font-size: 18px;
  font-weight: 700;
  color: #1F2329;
}

.expand-hint {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  user-select: none;
}

.tool-full-desc {
  font-size: 14px;
  color: #555A62;
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-card.expanded .tool-full-desc {
  display: block;
  -webkit-line-clamp: unset;
}

.meta-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.meta-row-split {
  gap: 32px;
}

.meta-half {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #F5F5F5;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.meta-text {
  font-size: 13px;
  color: #555A62;
  line-height: 1.6;
}

.no-libs {
  color: #C0C4CC;
}

/* Expanded detail */
.card-detail {
  cursor: default;
}

.detail-section {
  margin-bottom: 4px;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 6px;
  margin: 0 0 14px 0;
}

.badge-flow {
  background: #ECF5FF;
  color: #409EFF;
}

.badge-exec {
  background: #F0F9EB;
  color: #67C23A;
}

.badge-examples {
  background: #F4F0FE;
  color: #9065E6;
}

.detail-section h5 {
  font-size: 14px;
  color: #303133;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.flow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.flow-item p {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.6;
  margin: 0 0 10px 0;
}

.logic-steps {
  margin: 0;
  padding-left: 22px;
  font-size: 13px;
  color: #555A62;
  line-height: 2;
}

.logic-steps li {
  padding-left: 2px;
}

.example-item {
  margin-bottom: 8px;
}

.example-name {
  font-size: 14px;
  color: #1F2329;
  margin: 0 0 14px 0;
  font-weight: 600;
}

.example-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.inline-params {
  font-size: 13px;
  color: #555A62;
  background: #F8F9FA;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.example-block {
  margin-bottom: 14px;
}

.example-label {
  font-size: 12px;
  font-weight: 600;
  color: #969BA3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .flow-grid,
  .example-row {
    grid-template-columns: 1fr;
  }

  .exec-meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
