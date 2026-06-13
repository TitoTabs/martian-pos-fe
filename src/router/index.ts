import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pos' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: 'pos',
          name: 'pos',
          component: () => import('@/views/PosView.vue'),
        },
        {
          path: 'barista',
          name: 'barista',
          component: () => import('@/views/BaristaView.vue'),
        },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductsView.vue'),
        },
        {
          path: 'inventory-items',
          name: 'inventory-items',
          component: () => import('@/views/InventoryItemsView.vue'),
        },
        {
          path: 'add-ons',
          name: 'add-ons',
          component: () => import('@/views/AddonsView.vue'),
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@/views/ExpensesView.vue'),
        },
        {
          path: 'manual-sales',
          name: 'manual-sales',
          component: () => import('@/views/ManualSalesView.vue'),
        },
        {
          path: 'savings',
          name: 'savings',
          component: () => import('@/views/SavingsView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/ReportsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: '/admin/dashboard' }
  }
})

export default router
