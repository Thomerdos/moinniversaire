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
      <div class="panzoom-canvas" ref="canvasRef" :style="canvasStyle">
        <div 
          v-for="(photo, index) in gridPhotos" 
          :key="photo.id"
          class="photo-frame"
          :style="photo.style"
          @click.stop="handlePhotoClick(index, $event)"
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
let isDragging = ref(false)
let dragStartPos = { x: 0, y: 0 }

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

// Seeded random for consistent masonry pattern
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate masonry-like layout - varied sizes but photos still touch
const gridPhotos = computed(() => {
  if (photos.value.length === 0) return []
  
  const shuffled = shuffleArray(photos.value)
  const baseUnit = isMobile.value ? 180 : 280
  
  // Create a more organic masonry layout
  // We'll use a bin-packing approach where photos have varied sizes
  const positions = []
  let currentX = 0
  let currentY = 0
  let rowHeight = 0
  let maxWidth = isMobile.value ? 4 : 5 // max units per row
  let rowItems = []
  
  shuffled.forEach((photo, index) => {
    // Vary size based on aspect ratio and some randomness
    const ratio = photo.width / photo.height
    const seed = index * 137.5 // Golden angle for variety
    const randomFactor = seededRandom(seed)
    
    let widthUnits, heightUnits
    
    if (ratio > 1.3) {
      // Wide landscape
      widthUnits = randomFactor > 0.5 ? 2 : 1.5
      heightUnits = 1
    } else if (ratio < 0.75) {
      // Tall portrait
      widthUnits = 1
      heightUnits = randomFactor > 0.5 ? 2 : 1.5
    } else {
      // Square-ish - vary sizes
      const sizes = [1, 1.2, 1.5]
      const sizeIndex = Math.floor(randomFactor * sizes.length)
      widthUnits = sizes[sizeIndex]
      heightUnits = sizes[(sizeIndex + 1) % sizes.length]
    }
    
    const width = widthUnits * baseUnit
    const height = heightUnits * baseUnit
    
    // Simple row-based layout with varied heights
    if (currentX + widthUnits > maxWidth && rowItems.length > 0) {
      // Start new row
      currentY += rowHeight
      currentX = 0
      rowHeight = 0
      rowItems = []
    }
    
    positions.push({
      ...photo,
      x: currentX * baseUnit,
      y: currentY,
      width,
      height
    })
    
    currentX += widthUnits
    rowHeight = Math.max(rowHeight, height)
    rowItems.push(index)
  })
  
  return positions.map((photo) => ({
    ...photo,
    style: {
      left: `${photo.x}px`,
      top: `${photo.y}px`,
      width: `${photo.width}px`,
      height: `${photo.height}px`,
      zIndex: 1
    }
  }))
})

// Calculate canvas size based on masonry layout
const canvasStyle = computed(() => {
  if (gridPhotos.value.length === 0) return { width: '100%', height: '100%' }
  
  let maxRight = 0
  let maxBottom = 0
  
  gridPhotos.value.forEach(photo => {
    const right = parseFloat(photo.style.left) + parseFloat(photo.style.width)
    const bottom = parseFloat(photo.style.top) + parseFloat(photo.style.height)
    maxRight = Math.max(maxRight, right)
    maxBottom = Math.max(maxBottom, bottom)
  })
  
  return {
    width: `${maxRight}px`,
    height: `${maxBottom}px`
  }
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
  
  // Get canvas dimensions from computed style
  const canvasDims = canvasStyle.value
  const canvasWidth = parseFloat(canvasDims.width)
  const canvasHeight = parseFloat(canvasDims.height)
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Calculate scale to fill the viewport completely
  // We want photos to fill the screen, with some extending beyond for exploration
  const scaleToFitWidth = viewportWidth / canvasWidth
  const scaleToFitHeight = viewportHeight / canvasHeight
  
  // Use a scale that shows just a portion of the grid (2-4 photos visible)
  // This means we want a higher scale than fitScreen
  const idealScale = Math.max(scaleToFitWidth, scaleToFitHeight) * 1.3
  
  // Center the canvas so photos fill the screen from the start
  const scaledWidth = canvasWidth * idealScale
  const scaledHeight = canvasHeight * idealScale
  const startX = (viewportWidth - scaledWidth) / 2
  const startY = (viewportHeight - scaledHeight) / 2
  
  panzoomInstance = Panzoom(canvasRef.value, {
    maxScale: 5,
    minScale: 0.3,
    startScale: idealScale,
    startX: startX,
    startY: startY,
    cursor: 'grab',
    canvas: true,
    touchAction: 'none'
  })
  
  // Track drag to prevent click after drag
  viewportRef.value.addEventListener('pointerdown', (e) => {
    dragStartPos = { x: e.clientX, y: e.clientY }
    isDragging.value = false
  })
  
  viewportRef.value.addEventListener('pointermove', (e) => {
    const dx = Math.abs(e.clientX - dragStartPos.x)
    const dy = Math.abs(e.clientY - dragStartPos.y)
    if (dx > 5 || dy > 5) {
      isDragging.value = true
    }
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

const handlePhotoClick = (index, event) => {
  // Don't open lightbox if we were dragging
  if (isDragging.value) {
    isDragging.value = false
    return
  }
  openLightbox(index)
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

/* Panzoom canvas - dynamic size based on grid */
.panzoom-canvas {
  position: relative;
  transform-origin: 0 0;
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
