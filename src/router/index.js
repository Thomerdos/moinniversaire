import { createRouter, createWebHashHistory } from 'vue-router'
import IsItThe18th from '../views/IsItThe18th.vue'
import TimeTogether from '../views/TimeTogether.vue'

const routes = [
  {
    path: '/',
    name: 'IsItThe18th',
    component: IsItThe18th
  },
  {
    path: '/temps-ensemble',
    name: 'TimeTogether',
    component: TimeTogether
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
