<template>
  <div class="photo-gallery-container min-h-screen bg-gray-900 overflow-hidden" ref="containerRef">
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

    <!-- Panzoom gallery -->
    <div v-else class="gallery-viewport" ref="viewportRef">
      <!-- Zoom controls -->
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn" title="Zoom avant">+</button>
        <button @click="zoomOut" class="zoom-btn" title="Zoom arrière">−</button>
        <button @click="resetZoom" class="zoom-btn reset-btn" title="Réinitialiser">⟲</button>
      </div>

      <!-- Panzoom canvas -->
      <div class="panzoom-canvas" ref="canvasRef">
        <div 
          v-for="(photo, index) in gridPhotos" 
          :key="photo.id"
          class="photo-frame"
          :style="photo.style"
          @click.stop="openLightbox(index)"
        >
          <img 
            :src="photo.thumbnail" 
            :alt="photo.title || formatDate(photo.date)"
            class="photo-image"
            loading="lazy"
            draggable="false"
          />
          <div class="photo-overlay">
            <p v-if="photo.date" class="photo-date">{{ formatDate(photo.date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Panzoom from '@panzoom/panzoom'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

const loading = ref(true)
const photos = ref([])
const containerRef = ref(null)
const viewportRef = ref(null)
const canvasRef = ref(null)
const isMobile = ref(false)
let panzoomInstance = null

// Check if mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768 || 'ontouchstart' in window
}

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate tight grid layout where photos touch - BIG images for exploration
const gridPhotos = computed(() => {
  if (photos.value.length === 0) return []
  
  const shuffled = shuffleArray(photos.value)
  // Much bigger photos - only 2-3 visible at a time to encourage exploration
  const photoSize = isMobile.value ? 280 : 450
  const cols = isMobile.value ? 2 : 3
  
  return shuffled.map((photo, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    // Determine size based on aspect ratio
    const ratio = photo.width / photo.height
    let width, height
    if (ratio > 1.2) {
      // Landscape - wider
      width = photoSize * 1.3
      height = photoSize
    } else if (ratio < 0.85) {
      // Portrait - taller
      width = photoSize
      height = photoSize * 1.3
    } else {
      // Square-ish
      width = photoSize
      height = photoSize
    }
    
    // Position in tight grid (photos touching)
    const x = col * photoSize
    const y = row * photoSize
    
    return {
      ...photo,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 1
      }
    }
  })
})

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

const initPanzoom = () => {
  if (!canvasRef.value || !viewportRef.value) return
  
  // Start centered on the grid
  const startOffset = isMobile.value ? -100 : -200
  
  panzoomInstance = Panzoom(canvasRef.value, {
    maxScale: 4,
    minScale: 0.3,
    startScale: isMobile.value ? 0.9 : 0.7,
    startX: startOffset,
    startY: startOffset,
    cursor: 'grab',
    canvas: true,
    touchAction: 'none' // Important for mobile touch handling
  })
  
  // Enable mouse wheel zoom (desktop)
  viewportRef.value.addEventListener('wheel', (event) => {
    event.preventDefault()
    panzoomInstance.zoomWithWheel(event)
  }, { passive: false })
}

const zoomIn = () => {
  if (panzoomInstance) {
    panzoomInstance.zoomIn()
  }
}

const zoomOut = () => {
  if (panzoomInstance) {
    panzoomInstance.zoomOut()
  }
}

const resetZoom = () => {
  if (panzoomInstance) {
    panzoomInstance.reset()
  }
}

const openLightbox = async (index) => {
  await nextTick()
  
  const items = gridPhotos.value.map(photo => ({
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
    // Mobile-friendly options
    pinchToClose: true,
    closeOnVerticalDrag: true,
    padding: { top: 20, bottom: 20, left: 10, right: 10 }
  })

  pswp.init()
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await loadPhotos()
  await nextTick()
  setTimeout(initPanzoom, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  if (panzoomInstance) {
    panzoomInstance.destroy()
  }
})
</script>

<style scoped>
.photo-gallery-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  position: relative;
}

.gallery-viewport {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.gallery-viewport:active {
  cursor: grabbing;
}

/* Zoom controls */
.zoom-controls {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.zoom-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

.zoom-btn:hover,
.zoom-btn:active {
  background: rgba(102, 126, 234, 0.6);
  transform: scale(1.1);
}

.reset-btn {
  font-size: 1.2rem;
}

/* Panzoom canvas - sized for big images */
.panzoom-canvas {
  position: relative;
  width: 3000px;
  height: 3000px;
  transform-origin: center center;
}

/* Photo frame - tight grid, no gaps */
.photo-frame {
  position: absolute;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s ease,
              z-index 0s;
  -webkit-tap-highlight-color: transparent;
}

.photo-frame:hover,
.photo-frame:active {
  transform: scale(1.1) !important;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.8);
  z-index: 1000 !important;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* Photo overlay - hidden on mobile for cleaner look */
.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-frame:hover .photo-overlay {
  opacity: 1;
}

.photo-date {
  color: white;
  font-size: 0.75rem;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Custom PhotoSwipe styles */
:deep(.pswp) {
  --pswp-bg: #0f0f23;
}

:deep(.pswp__button) {
  color: white;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .panzoom-canvas {
    width: 1800px;
    height: 1800px;
  }
  
  .zoom-controls {
    bottom: 1rem;
    right: 1rem;
    flex-direction: row;
    gap: 0.75rem;
  }
  
  .zoom-btn {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
  }
  
  .reset-btn {
    font-size: 1.1rem;
  }
  
  /* Hide overlay on mobile - tap to view */
  .photo-overlay {
    display: none;
  }
}

/* Very small screens */
@media (max-width: 400px) {
  .zoom-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
