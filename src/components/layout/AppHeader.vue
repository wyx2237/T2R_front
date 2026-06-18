<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const uiStore = useUiStore()

const fonts = ['Inter', 'IBM Plex Sans', 'DM Sans'] as const

function onFontChange(font: string) {
  uiStore.setDisplayFont(font)
}
</script>

<template>
  <header class="app-header">
    <div class="header-left" @click="router.push('/')">
      <span class="logo-circle">⚕</span>
      <span class="title">Clinical Quantitative Platform</span>
    </div>
    <div class="header-right">
      <el-popover
        trigger="click"
        placement="bottom-end"
        :width="240"
        popper-class="settings-popover"
      >
        <template #reference>
          <el-icon :size="20" class="settings-btn">
            <Setting />
          </el-icon>
        </template>

        <div class="settings-panel">
          <h4 class="settings-title">Settings</h4>

          <div class="setting-group">
            <label class="setting-label">Display Font</label>
            <div class="font-options">
              <label
                v-for="font in fonts"
                :key="font"
                class="font-option"
                :class="{ active: uiStore.displayFont === font }"
              >
                <input
                  type="radio"
                  name="displayFont"
                  :value="font"
                  :checked="uiStore.displayFont === font"
                  @change="onFontChange(font)"
                />
                <span class="font-preview" :style="{ fontFamily: font }">{{ font }}</span>
              </label>
            </div>
          </div>
        </div>
      </el-popover>

      <el-avatar :size="32" icon="UserFilled" class="avatar" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: var(--claude-warm-header);
  border-bottom: 1px solid var(--claude-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--claude-sidebar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  color: #fff;
  flex-shrink: 0;
  font-weight: 500;
}

.title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--claude-orange);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.settings-btn {
  cursor: pointer;
  color: var(--claude-text-mid);
  transition: color 0.2s;
}

.settings-btn:hover {
  color: var(--claude-orange);
}

.avatar {
  cursor: pointer;
}
</style>

<style>
/* Global popover styles (unscoped) */
.settings-popover {
  padding: 0 !important;
}

.settings-panel {
  padding: 16px;
}

.settings-title {
  margin: 0 0 16px 0;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--claude-text-dark);
}

.setting-group {
  margin-bottom: 12px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--claude-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.font-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.font-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.font-option:hover {
  background: var(--el-color-primary-light-9);
}

.font-option.active {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--claude-orange);
  padding: 7px 11px;
}

.font-option input {
  accent-color: var(--claude-orange);
  margin: 0;
}

.font-preview {
  font-size: 14px;
  font-weight: 500;
  color: var(--claude-text-dark);
}
</style>
