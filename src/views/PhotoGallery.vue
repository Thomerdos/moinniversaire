<template>
  <div class="photo-gallery-container min-h-screen bg-gray-900">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center text-white">
        <div class="text-6xl mb-4 animate-pulse">📷</div>
        <p class="text-xl">Chargement des photos...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="photos.length === 0" class="flex items-center justify-center min-h-screen">
      <div class="text-center text-white">
        <div class="text-6xl mb-4">📸</div>
        <p class="text-xl">Aucune photo disponible</p>
        <p class="text-gray-400 mt-2">L'album sera bientôt rempli de souvenirs !</p>
      </div>
    </div>

    <!-- Photo gallery -->
    <div v-else class="gallery-grid pt-20 pb-8 px-4">
      <div 
        v-for="(photo, index) in photos" 
        :key="photo.id"
        class="gallery-item relative overflow-hidden rounded-lg cursor-zoom-in group"
        @click="openLightbox(index)"
      >
        <img 
          :src="photo.thumbnail" 
          :alt="photo.title || `Photo ${index + 1}`"
          class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <p v-if="photo.title" class="text-white text-sm font-medium truncate">{{ photo.title }}</p>
            <p v-if="photo.date" class="text-gray-300 text-xs">{{ formatDate(photo.date) }}</p>
          </div>
        </div>
        <!-- Hover effect sparkle -->
        <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="sparkle-effect"></div>
        </div>
      </div>
    </div>

    <!-- Lightbox container for PhotoSwipe -->
    <div ref="lightboxContainer" class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter"></div>
            <button class="pswp__button pswp__button--close" title="Fermer (Esc)"></button>
            <button class="pswp__button pswp__button--zoom" title="Zoom"></button>
            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="pswp__caption">
            <div class="pswp__caption__center"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

const loading = ref(true)
const photos = ref([])
const lightboxContainer = ref(null)

// Placeholder photos for demonstration - will be replaced by Google Photos sync
const placeholderPhotos = [
  { id: '1', thumbnail: 'https://picsum.photos/seed/1/400/300', src: 'https://picsum.photos/seed/1/1200/900', width: 1200, height: 900, title: 'Notre premier souvenir' },
  { id: '2', thumbnail: 'https://picsum.photos/seed/2/400/300', src: 'https://picsum.photos/seed/2/1200/900', width: 1200, height: 900, title: 'Un moment magique' },
  { id: '3', thumbnail: 'https://picsum.photos/seed/3/400/300', src: 'https://picsum.photos/seed/3/1200/900', width: 1200, height: 900, title: 'Ensemble' },
  { id: '4', thumbnail: 'https://picsum.photos/seed/4/400/300', src: 'https://picsum.photos/seed/4/1200/900', width: 1200, height: 900, title: 'Voyage' },
  { id: '5', thumbnail: 'https://picsum.photos/seed/5/400/300', src: 'https://picsum.photos/seed/5/1200/900', width: 1200, height: 900, title: 'Sourires' },
  { id: '6', thumbnail: 'https://picsum.photos/seed/6/400/300', src: 'https://picsum.photos/seed/6/1200/900', width: 1200, height: 900, title: 'Bonheur' },
  { id: '7', thumbnail: 'https://picsum.photos/seed/7/400/300', src: 'https://picsum.photos/seed/7/1200/900', width: 1200, height: 900, title: 'Aventure' },
  { id: '8', thumbnail: 'https://picsum.photos/seed/8/400/300', src: 'https://picsum.photos/seed/8/1200/900', width: 1200, height: 900, title: 'Rêves' },
  { id: '9', thumbnail: 'https://picsum.photos/seed/9/400/300', src: 'https://picsum.photos/seed/9/1200/900', width: 1200, height: 900, title: 'Complicité' },
]

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const loadPhotos = async () => {
  loading.value = true
  try {
    // Try to load photos from the synced data file
    const response = await fetch('./photos-data.json')
    if (response.ok) {
      const data = await response.json()
      photos.value = data.photos || []
    } else {
      // Use placeholder photos for demonstration
      photos.value = placeholderPhotos
    }
  } catch {
    // Use placeholder photos if fetch fails
    photos.value = placeholderPhotos
  }
  loading.value = false
}

const openLightbox = async (index) => {
  await nextTick()
  
  const items = photos.value.map(photo => ({
    src: photo.src,
    width: photo.width || 1200,
    height: photo.height || 900,
    alt: photo.title || '',
  }))

  const pswp = new PhotoSwipe({
    dataSource: items,
    index: index,
    bgOpacity: 0.95,
    showHideAnimationType: 'zoom',
  })

  pswp.init()
}

onMounted(() => {
  loadPhotos()
})
</script>

<style scoped>
.photo-gallery-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-width: 1600px;
  margin: 0 auto;
}

.gallery-item {
  aspect-ratio: 4/3;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
}

/* Sparkle effect on hover */
.sparkle-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  animation: sparkle 1.5s ease infinite;
}

@keyframes sparkle {
  0% { background-position: -100% -100%; }
  100% { background-position: 200% 200%; }
}

/* Custom PhotoSwipe styles */
:deep(.pswp) {
  --pswp-bg: #1a1a2e;
}

:deep(.pswp__button) {
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.5rem;
  }
}

@media (min-width: 1200px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}
</style>
