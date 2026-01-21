<template>
  <div class="photo-gallery-container min-h-screen bg-gray-900 overflow-hidden">
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

    <!-- Horizontal scrolling gallery -->
    <div v-else class="gallery-wrapper pt-20">
      <!-- Scroll hint -->
      <div class="scroll-hint text-center text-white/60 mb-4 flex items-center justify-center gap-2">
        <span class="text-sm">← Faites défiler →</span>
      </div>
      
      <!-- Horizontal scroll container -->
      <div class="gallery-horizontal" ref="galleryRef">
        <div 
          v-for="(photo, index) in shuffledPhotos" 
          :key="photo.id"
          class="gallery-item relative overflow-hidden rounded-2xl cursor-zoom-in group flex-shrink-0"
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
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p v-if="photo.date" class="text-white text-sm font-medium">{{ formatDate(photo.date) }}</p>
            </div>
          </div>
          <!-- Sparkle effect on hover -->
          <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div class="sparkle-effect"></div>
          </div>
          <!-- Glow effect -->
          <div class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 glow-effect"></div>
        </div>
      </div>
      
      <!-- Scroll progress indicator -->
      <div class="scroll-progress-container mt-6 px-8">
        <div class="scroll-progress-track">
          <div class="scroll-progress-bar" :style="{ width: scrollProgress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

const loading = ref(true)
const photos = ref([])
const shuffledPhotos = ref([])
const galleryRef = ref(null)
const scrollProgress = ref(0)

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
    return 'landscape'
  } else if (ratio < 0.8) {
    return 'portrait'
  }
  return 'square'
}

const updateScrollProgress = () => {
  if (!galleryRef.value) return
  const { scrollLeft, scrollWidth, clientWidth } = galleryRef.value
  const maxScroll = scrollWidth - clientWidth
  scrollProgress.value = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
}

const loadPhotos = async () => {
  loading.value = true
  try {
    const response = await fetch('./photos/photos-data.json')
    if (response.ok) {
      const data = await response.json()
      photos.value = data.photos || []
      // Shuffle once when photos are loaded
      shuffledPhotos.value = shuffleArray(photos.value)
    }
  } catch (error) {
    console.error('Error loading photos:', error)
  }
  loading.value = false
}

const openLightbox = async (index) => {
  await nextTick()
  
  const items = shuffledPhotos.value.map(photo => ({
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

onMounted(async () => {
  await loadPhotos()
  await nextTick()
  if (galleryRef.value) {
    galleryRef.value.addEventListener('scroll', updateScrollProgress)
  }
})

onUnmounted(() => {
  if (galleryRef.value) {
    galleryRef.value.removeEventListener('scroll', updateScrollProgress)
  }
})
</script>

<style scoped>
.photo-gallery-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
}

.gallery-wrapper {
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
}

/* Horizontal scrolling gallery */
.gallery-horizontal {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 2rem 2rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;
  flex: 1;
  align-items: center;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.5) transparent;
}

.gallery-horizontal::-webkit-scrollbar {
  height: 8px;
}

.gallery-horizontal::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-horizontal::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
}

/* Base gallery item */
.gallery-item {
  scroll-snap-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.5s ease;
}

.gallery-item:hover {
  transform: scale(1.05) translateY(-10px);
  box-shadow: 0 25px 80px rgba(102, 126, 234, 0.5);
  z-index: 10;
}

/* Portrait images - taller */
.gallery-item.portrait {
  width: 300px;
  height: 450px;
}

/* Landscape images - wider */
.gallery-item.landscape {
  width: 500px;
  height: 350px;
}

/* Square images */
.gallery-item.square {
  width: 350px;
  height: 350px;
}

/* Scroll progress indicator */
.scroll-progress-container {
  padding-bottom: 2rem;
}

.scroll-progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  max-width: 300px;
  margin: 0 auto;
}

.scroll-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  border-radius: 2px;
  transition: width 0.1s ease-out;
}

/* Scroll hint animation */
.scroll-hint {
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* Sparkle animation */
.sparkle-effect {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 20%,
    rgba(255, 255, 255, 0.2) 40%,
    rgba(255, 255, 255, 0.2) 60%,
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
  box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.15),
              0 0 60px rgba(102, 126, 234, 0.4);
}

/* Custom PhotoSwipe styles */
:deep(.pswp) {
  --pswp-bg: #0f0f23;
}

:deep(.pswp__button) {
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .gallery-horizontal {
    gap: 1rem;
    padding: 1rem;
  }
  
  .gallery-item.portrait {
    width: 220px;
    height: 330px;
  }
  
  .gallery-item.landscape {
    width: 350px;
    height: 250px;
  }
  
  .gallery-item.square {
    width: 260px;
    height: 260px;
  }
}

@media (min-width: 1400px) {
  .gallery-item.portrait {
    width: 380px;
    height: 570px;
  }
  
  .gallery-item.landscape {
    width: 650px;
    height: 450px;
  }
  
  .gallery-item.square {
    width: 450px;
    height: 450px;
  }
}
</style>
