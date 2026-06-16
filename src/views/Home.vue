<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

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
    title: 'Metrics',
    subtitle: '指标管理',
    desc: '管理计算指标定义、参数配置和计算流水线，支持 Pipeline 可视化展示。',
    route: '/metrics',
  },
  {
    icon: 'Operation',
    title: 'Compute',
    subtitle: '定量计算',
    desc: '上传病例 → 选择指标 → 一键执行计算，参数抽取透明，步骤逐级可追溯。',
    route: '/compute/upload',
  },
  {
    icon: 'SetUp',
    title: 'Tools',
    subtitle: '工具模板库',
    desc: '8 个内置原子计算工具，只读展示，作为 LLM 拆解计算步骤时的可解释锚点。',
    route: '/tools',
  },
]
</script>

<template>
  <div class="home-page">
    <!-- Hero -->
    <section class="hero">
      <h1 class="hero-title">Clinical Quantitative Platform</h1>
      <p class="hero-subtitle">医疗定量计算平台</p>
      <p class="hero-desc">面向临床场景的参数抽取与定量计算系统</p>
      <div class="hero-actions">
        <el-button type="primary" size="large" round @click="goCompute">
          <el-icon><Operation /></el-icon>
          进入计算执行
        </el-button>
        <el-button size="large" round @click="goDoc">
          <el-icon><Document /></el-icon>
          详细文档
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
                进入 &rarr;
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
  text-align: center;
  padding: 60px 20px 48px;
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px;
}

.hero-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0 0 12px;
}

.hero-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
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
  background: #ECF5FF;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409EFF;
  flex-shrink: 0;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.module-subtitle {
  font-size: 12px;
  color: #909399;
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
