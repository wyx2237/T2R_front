import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useComputeStore } from '@/stores/compute'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/metrics',
    name: 'MetricList',
    component: () => import('@/views/metrics/MetricList.vue'),
  },
  {
    path: '/metrics/create',
    name: 'MetricCreate',
    component: () => import('@/views/metrics/MetricCreate.vue'),
  },
  {
    path: '/metrics/:id',
    name: 'MetricDetail',
    component: () => import('@/views/metrics/MetricDetail.vue'),
    props: true,
  },
  {
    path: '/metrics/:id/edit',
    name: 'MetricEdit',
    component: () => import('@/views/metrics/MetricEdit.vue'),
    props: true,
  },
  {
    path: '/compute',
    redirect: '/compute/upload',
  },
  {
    path: '/compute/upload',
    name: 'ComputeUpload',
    component: () => import('@/views/compute/ComputeUpload.vue'),
  },
  {
    path: '/compute/:sessionId/select',
    name: 'ComputeSelect',
    component: () => import('@/views/compute/ComputeSelect.vue'),
    props: true,
    beforeEnter: (_to, _from, next) => {
      const store = useComputeStore()
      if (!store.sessionId) {
        next('/compute/upload')
      } else {
        next()
      }
    },
  },
  {
    path: '/compute/:sessionId/execute',
    name: 'ComputeResult',
    component: () => import('@/views/compute/ComputeResult.vue'),
    props: true,
    beforeEnter: (_to, _from, next) => {
      const store = useComputeStore()
      if (!store.sessionId) {
        next('/compute/upload')
      } else {
        next()
      }
    },
  },
  {
    path: '/tools',
    name: 'ToolLibrary',
    component: () => import('@/views/tools/ToolLibrary.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
