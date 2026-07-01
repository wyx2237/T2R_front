<template>
  <div class="app-logo" :class="{ collapsed, 'is-large': large }">
    <!-- Icon -->
    <div class="logo-icon">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradientSidebar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D97757" />
            <stop offset="100%" stop-color="#E8A87C" />
          </linearGradient>
          <linearGradient id="logoGradientHero" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D97757" />
            <stop offset="100%" stop-color="#E8A87C" />
          </linearGradient>
        </defs>

        <g :fill="large ? 'url(#logoGradientHero)' : 'url(#logoGradientSidebar)'"
           :stroke="large ? 'url(#logoGradientHero)' : 'url(#logoGradientSidebar)'">

          <path d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 Z" stroke="none" opacity="0.08" />
          <path d="M50 10 L89 32.5 V77.5 L50 100 L11 77.5 V32.5 Z" fill="none" stroke-width="8" stroke-linejoin="round" />
          <rect x="42" y="30" width="16" height="50" rx="4" stroke="none" />
          <rect x="25" y="47" width="50" height="16" rx="4" stroke="none" />
          <circle cx="50" cy="55" r="10" fill="var(--el-bg-color)" stroke="none" />
          <circle cx="50" cy="55" r="5" fill="#D97757" stroke="none" />
        </g>
      </svg>
    </div>

    <!-- Title -->
    <Transition name="fade-slide">
      <h1 v-show="!collapsed" class="logo-title">SRGE</h1>
    </Transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  collapsed?: boolean
  large?: boolean
}>()
</script>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  transition: all 0.3s;
  padding-left: 20px;
}

.app-logo.collapsed {
  padding-left: 0;
  justify-content: center;
}
.app-logo.collapsed .logo-icon {
  width: 32px;
  height: 32px;
}

.app-logo.is-large {
  padding-left: 0;
  justify-content: center;
  gap: 16px;
}
.app-logo.is-large .logo-icon {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 4px 12px rgba(217, 119, 87, 0.35));
}
.app-logo.is-large .logo-title {
  margin: 0;
  font-family: 'Carter One', cursive;
  font-size: 48px;
  font-weight: 400;
  letter-spacing: 2px;
  color: #3C2A1E;
  text-transform: uppercase;
  -webkit-text-fill-color: initial;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
}
.logo-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.logo-title {
  margin: 0 0 0 10px;
  font-family: 'Carter One', cursive;
  font-weight: 400;
  font-size: 22px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--claude-text-dark);
  white-space: nowrap;
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
  transition-delay: 0.1s;
}
.fade-slide-leave-active {
  transition: all 0.1s ease-in;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
