<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLogo from '@/components/Logo.vue'

const router = useRouter()

function goCompute() {
  router.push('/compute/upload')
}

function goDoc() {
  ElMessage.info('Documentation coming soon')
}

const modules = [
  {
    icon: 'DataAnalysis',
    title: 'Indicators',
    subtitle: 'Indicator Management',
    desc: 'Manage indicator definitions, parameter configurations, and computation pipelines with visual Pipeline display.',
    route: '/metrics',
  },
  {
    icon: 'Operation',
    title: 'Compute',
    subtitle: 'Quantitative Computation',
    desc: 'Upload case → Select indicator → One-click compute. Transparent parameter extraction with traceable steps.',
    route: '/compute/upload',
  },
  {
    icon: 'SetUp',
    title: 'Templates',
    subtitle: 'Tool Template Library',
    desc: '8 built-in atomic computation tools, read-only display, serving as interpretable anchors for LLM computation decomposition.',
    route: '/tools',
  },
]
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg-decoration" />
      <AppLogo large />
      <p class="hero-subtitle">Structured Rule Generation &amp; Execution System</p>
      <div class="hero-divider" />
      <p class="hero-desc">Supporting Clinical Medical Computation</p>
      <p class="hero-desc-secondary">This system is designed for clinicians and physicians. It helps doctors define, validate, and execute clinical rules in a transparent and auditable way, supporting evidence-based medical computation in daily practice.</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" round @click="goCompute">
          <el-icon><Operation /></el-icon>
          Start Calculation
        </el-button>
        <el-button size="large" round @click="goDoc">
          <el-icon><Document /></el-icon>
          Documentation
        </el-button>
      </div>
    </section>

    <!-- Module Cards -->
    <section class="modules">
      <el-row :gutter="24">
        <el-col
          v-for="mod in modules"
          :key="mod.title"
          :span="8"
        >
          <el-card class="module-card" shadow="hover" @click="router.push(mod.route)">
            <div class="module-header">
              <div class="module-icon">
                <el-icon :size="28">
                  <component :is="mod.icon" />
                </el-icon>
              </div>
              <div>
                <div class="module-title">{{ mod.title }}</div>
                <div class="module-subtitle">{{ mod.subtitle }}</div>
              </div>
            </div>
            <p class="module-desc">{{ mod.desc }}</p>
            <div class="module-action">
              <el-button text type="primary">
                Enter &rarr;
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1000px;
  margin: 0 auto;
}

/* ── Hero ── */
.hero {
  position: relative;
  text-align: center;
  padding: 72px 20px 56px;
  margin: 0 0 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #FEF8F2 0%, #F5EDE4 50%, #EFE6DA 100%);
  overflow: hidden;
}

.hero-bg-decoration {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 119, 87, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.hero-bg-decoration::before {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(217, 119, 87, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

.hero :deep(.app-logo) {
  margin-bottom: 16px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 800;
  color: #3C2A1E;
  margin: 0 0 8px;
  letter-spacing: 6px;
  text-transform: uppercase;
}

.hero-subtitle {
  font-size: 36px;
  font-weight: 500;
  color: #6B5744;
  margin: 0 0 20px;
  letter-spacing: 0.5px;
  font-family: 'Carter One', cursive;
}

.hero-divider {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #D97757, #E8A87C);
  border-radius: 2px;
  margin: 0 auto 20px;
}

.hero-desc {
  font-size: 15px;
  font-weight: 600;
  color: #8B7355;
  margin: 0 0 16px;
  letter-spacing: 0.3px;
}

.hero-desc-secondary {
  font-size: 14px;
  color: #7A6A5A;
  margin: 0 auto 36px;
  line-height: 1.8;
  max-width: 560px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* ── Module Cards ── */
.modules {
  padding-bottom: 40px;
}

.module-card {
  cursor: pointer;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.module-card:hover {
  transform: translateY(-4px);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.module-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--claude-orange);
  flex-shrink: 0;
}

.module-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.module-subtitle {
  font-size: 12px;
  color: var(--claude-text-light);
  margin-top: 2px;
}

.module-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.7;
  margin: 0;
  min-height: 44px;
}

.module-action {
  text-align: right;
  margin-top: 12px;
}
</style>
