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

    <!-- Photo gallery with masonry layout -->
    <div v-else class="gallery-masonry pt-20 pb-8 px-4">
      <div 
        v-for="(photo, index) in photos" 
        :key="photo.id"
        class="gallery-item relative overflow-hidden rounded-xl cursor-zoom-in group"
        :class="getItemClass(photo)"
        @click="openLightbox(index)"
      >
        <img 
          :src="photo.thumbnail" 
          :alt="photo.title || formatDate(photo.date)"
          class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        <!-- Gradient overlay on hover -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <p v-if="photo.date" class="text-white text-sm font-medium">{{ formatDate(photo.date) }}</p>
          </div>
        </div>
        <!-- Sparkle effect on hover -->
        <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="sparkle-effect"></div>
        </div>
        <!-- Glow effect -->
        <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-effect"></div>
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

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Determine CSS class based on image orientation
const getItemClass = (photo) => {
  const ratio = photo.width / photo.height
  if (ratio > 1.3) {
    return 'landscape' // Wide image
  } else if (ratio < 0.8) {
    return 'portrait' // Tall image
  }
  return 'square' // Squarish image
}

const loadPhotos = async () => {
  loading.value = true
  try {
    const response = await fetch('./photos/photos-data.json')
    if (response.ok) {
      const data = await response.json()
      photos.value = data.photos || []
    }
  } catch (error) {
    console.error('Error loading photos:', error)
  }
  loading.value = false
}

const openLightbox = async (index) => {
  await nextTick()
  
  const items = photos.value.map(photo => ({
    src: photo.src,
    width: photo.width || 1200,
    height: photo.height || 900,
    alt: photo.title || formatDate(photo.date),
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

/* CSS Grid Masonry-like layout */
.gallery-masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: 200px;
  grid-auto-flow: dense;
  gap: 1rem;
  max-width: 1800px;
  margin: 0 auto;
}

/* Base gallery item */
.gallery-item {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.5s ease;
}

.gallery-item:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);
  z-index: 10;
}

/* Portrait images span 2 rows */
.gallery-item.portrait {
  grid-row: span 2;
}

/* Landscape images span 2 columns on larger screens */
@media (min-width: 768px) {
  .gallery-item.landscape {
    grid-column: span 2;
  }
}

/* Square images stay normal */
.gallery-item.square {
  grid-row: span 1;
}

/* Sparkle animation */
.sparkle-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 20%,
    rgba(255, 255, 255, 0.15) 40%,
    rgba(255, 255, 255, 0.15) 60%,
    transparent 80%
  );
  background-size: 300% 300%;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0% { background-position: 100% 100%; }
  50% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

/* Glow effect */
.glow-effect {
  box-shadow: inset 0 0 30px rgba(255, 255, 255, 0.1),
              0 0 40px rgba(102, 126, 234, 0.3);
}

/* Custom PhotoSwipe styles */
:deep(.pswp) {
  --pswp-bg: #0f0f23;
}

:deep(.pswp__button) {
  color: white;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .gallery-masonry {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 150px;
    gap: 0.5rem;
  }
  
  .gallery-item.portrait {
    grid-row: span 2;
  }
}

@media (min-width: 1200px) {
  .gallery-masonry {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-auto-rows: 250px;
  }
}

@media (min-width: 1600px) {
  .gallery-masonry {
    grid-template-columns: repeat(5, 1fr);
    grid-auto-rows: 280px;
  }
}
</style>
