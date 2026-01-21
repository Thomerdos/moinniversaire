import { createRouter, createWebHashHistory } from 'vue-router'
import IsItThe18th from '../views/IsItThe18th.vue'
import TimeTogether from '../views/TimeTogether.vue'
import BoulettesJour from '../views/BoulettesJour.vue'
import PhotoGallery from '../views/PhotoGallery.vue'

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
  },
  {
    path: '/boulettes-jour',
    name: 'BoulettesJour',
    component: BoulettesJour
  },
  {
    path: '/galerie',
    name: 'PhotoGallery',
    component: PhotoGallery
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
