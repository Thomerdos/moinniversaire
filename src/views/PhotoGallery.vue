<template>
  <div class="photo-gallery-container min-h-screen overflow-hidden" ref="containerRef">
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

      <!-- Panzoom canvas with column layout -->
      <div class="panzoom-canvas" ref="canvasRef" :style="canvasStyle">
        <div 
          v-for="(column, colIndex) in columns" 
          :key="colIndex"
          class="photo-column"
        >
          <div 
            v-for="(photo, photoIndex) in column" 
            :key="photo.id"
            class="photo-frame"
            @click.stop="handlePhotoClick(getPhotoGlobalIndex(colIndex, photoIndex), $event)"
          >
            <img 
              :src="photo.thumbnail" 
              :alt="photo.title || formatDate(photo.date)"
              class="photo-image"
              :style="{ height: photo.displayHeight + 'px' }"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Panzoom from '@panzoom/panzoom'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

// Layout constants
const COLUMN_WIDTH = 350 // Width of each column
const NUM_COLUMNS = 5 // Number of columns
const INITIAL_ZOOM = 1.0 // Start with natural zoom

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

// Distribute photos into columns (shortest column first)
const columns = computed(() => {
  if (photos.value.length === 0) return []
  
  const shuffled = shuffleArray(photos.value)
  const columnWidth = isMobile.value ? 200 : COLUMN_WIDTH
  const numCols = isMobile.value ? 3 : NUM_COLUMNS
  
  // Initialize columns with heights
  const cols = Array.from({ length: numCols }, () => ({ photos: [], height: 0 }))
  
  shuffled.forEach((photo) => {
    // Calculate display height based on aspect ratio
    const aspectRatio = photo.width / photo.height
    const displayHeight = columnWidth / aspectRatio
    
    // Find shortest column
    let shortestIndex = 0
    let shortestHeight = cols[0].height
    for (let i = 1; i < cols.length; i++) {
      if (cols[i].height < shortestHeight) {
        shortestHeight = cols[i].height
        shortestIndex = i
      }
    }
    
    // Add photo to shortest column
    cols[shortestIndex].photos.push({
      ...photo,
      displayHeight
    })
    cols[shortestIndex].height += displayHeight
  })
  
  return cols.map(col => col.photos)
})

// Get global photo index for lightbox
const getPhotoGlobalIndex = (colIndex, photoIndex) => {
  let index = 0
  for (let c = 0; c < colIndex; c++) {
    index += columns.value[c].length
  }
  return index + photoIndex
}

// Flatten photos for lightbox
const flatPhotos = computed(() => {
  return columns.value.flat()
})

// Calculate canvas size
const canvasStyle = computed(() => {
  const columnWidth = isMobile.value ? 200 : COLUMN_WIDTH
  const numCols = isMobile.value ? 3 : NUM_COLUMNS
  
  // Calculate max column height
  let maxHeight = 0
  columns.value.forEach(col => {
    const colHeight = col.reduce((sum, photo) => sum + photo.displayHeight, 0)
    maxHeight = Math.max(maxHeight, colHeight)
  })
  
  return {
    width: `${columnWidth * numCols}px`,
    height: `${maxHeight}px`
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
  
  const columnWidth = isMobile.value ? 200 : COLUMN_WIDTH
  const numCols = isMobile.value ? 3 : NUM_COLUMNS
  const canvasWidth = columnWidth * numCols
  
  // Calculate max column height
  let canvasHeight = 0
  columns.value.forEach(col => {
    const colHeight = col.reduce((sum, photo) => sum + photo.displayHeight, 0)
    canvasHeight = Math.max(canvasHeight, colHeight)
  })
  
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Calculate initial scale to fill the viewport
  const scaleToFillWidth = viewportWidth / canvasWidth
  const scaleToFillHeight = viewportHeight / canvasHeight
  const initialScale = Math.max(scaleToFillWidth, scaleToFillHeight) * 1.1
  
  // Center the canvas
  const scaledWidth = canvasWidth * initialScale
  const scaledHeight = canvasHeight * initialScale
  const startX = (viewportWidth - scaledWidth) / 2
  const startY = (viewportHeight - scaledHeight) / 2
  
  panzoomInstance = Panzoom(canvasRef.value, {
    maxScale: 5,
    minScale: 0.3,
    startScale: initialScale,
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
  
  const items = flatPhotos.value.map(photo => ({
    src: photo.src,
    width: photo.width || 1200,
    height: photo.height || 900,
    alt: photo.title || formatDate(photo.date),
  }))

  // Smaller padding on mobile to maximize image display
  const mobilePadding = { top: 0, bottom: 0, left: 0, right: 0 }
  const desktopPadding = { top: 20, bottom: 20, left: 20, right: 20 }

  const pswp = new PhotoSwipe({
    dataSource: items,
    index: index,
    bgOpacity: 1,
    showHideAnimationType: 'zoom',
    // Mobile-friendly options
    pinchToClose: true,
    closeOnVerticalDrag: true,
    padding: isMobile.value ? mobilePadding : desktopPadding,
    // Ensure images fit properly without distortion
    imageClickAction: 'zoom',
    tapAction: 'toggle-controls',
    // Better zoom settings
    initialZoomLevel: 'fit',
    secondaryZoomLevel: 2,
    maxZoomLevel: 4
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

/* Panzoom canvas with columns */
.panzoom-canvas {
  display: flex;
  flex-direction: row;
  transform-origin: 0 0;
}

/* Photo column - vertical layout */
.photo-column {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 350px;
}

/* Photo frame - no gaps */
.photo-frame {
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              box-shadow 0.3s ease,
              z-index 0s;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.photo-frame:hover,
.photo-frame:active {
  transform: scale(1.05);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.photo-image {
  width: 100%;
  display: block;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* Photo overlay */
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
  --pswp-bg: #1a1a2e;
}

:deep(.pswp__button) {
  color: white;
}

/* Ensure images fill properly on mobile */
:deep(.pswp__img) {
  object-fit: contain !important;
}

:deep(.pswp__zoom-wrap) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .photo-column {
    width: 200px;
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
