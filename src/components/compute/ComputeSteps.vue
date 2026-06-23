<script setup lang="ts">
defineProps<{
  active: number
}>()

const steps = [
  { title: 'Upload Case', icon: 'Upload' },
  { title: 'Select Indicators', icon: 'Search' },
  { title: 'Results', icon: 'Document' },
]
</script>

<template>
  <div class="compute-steps-wrapper">
    <div class="compute-steps">
      <template v-for="(step, i) in steps" :key="i">
        <div
          class="step-card"
          :class="{
            done: i < active,
            current: i === active,
            pending: i > active,
          }"
        >
          <span class="step-icon">
            <template v-if="i < active">&#10003;</template>
            <template v-else-if="i === active">&#9679;</template>
            <template v-else>&#9675;</template>
          </span>
          <span class="step-title">{{ step.title }}</span>
        </div>
        <span v-if="i < steps.length - 1" class="step-arrow">&gt;&gt;&gt;</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.compute-steps-wrapper {
  max-width: 1200px;
  margin: 0 auto 8px auto;
  border: 1px solid #E4E7ED;
  border-radius: 10px;
  background: #fff;
}

.compute-steps {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: 0;
  padding: 20px 16px;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.step-card.done {
  background: var(--claude-sidebar-bg);
  color: #5C4A3E;
}

.step-card.current {
  background: #D97757;
  color: #fff;
  box-shadow: 0 3px 12px rgba(217, 119, 87, 0.35);
}

.step-card.pending {
  background: var(--claude-warm-bg);
  color: #909399;
}

.step-icon {
  font-size: 20px;
  line-height: 1;
}

.step-arrow {
  font-size: 22px;
  color: #C0C4CC;
  margin: 0 6px;
  font-weight: 700;
}

.step-card.current + .step-arrow,
.step-card.done + .step-arrow {
  color: #D97757;
}
</style>
