<template>
  <div class="w-screen h-screen bg-gradient-to-br from-purple-gradient-start via-pink-gradient-start to-purple-gradient-end overflow-hidden">
    <!-- Loading state - fullscreen overlay with smooth fade transition -->
    <Transition name="fade-loader">
      <div v-if="loading" class="fixed inset-0 w-screen h-screen flex items-center justify-center z-50 bg-gradient-to-br from-purple-gradient-start via-pink-gradient-start to-purple-gradient-end">
        <div class="text-center">
          <!-- Animated spinner - bigger and more dynamic -->
          <div class="relative w-40 h-40 mx-auto mb-12">
            <!-- Outer rotating ring -->
            <div class="absolute inset-0 rounded-full border-8 border-white/10 animate-spin" style="animation-duration: 3s;"></div>
            
            <!-- Middle pulsing ring -->
            <div class="absolute inset-2 rounded-full border-6 border-transparent border-t-white border-r-white animate-spin" style="animation-duration: 1.5s;"></div>
            
            <!-- Inner glowing circle -->
            <div class="absolute inset-6 rounded-full bg-gradient-to-br from-purple-gradient-start to-pink-gradient-start animate-pulse" style="animation-duration: 2s;"></div>
            
            <!-- Center emoji with bounce -->
            <div class="absolute inset-0 flex items-center justify-center text-8xl animate-bounce" style="animation-duration: 1.5s;">📸</div>
          </div>
          
          <!-- Loading text - bigger -->
          <h2 class="text-4xl font-bold text-white mb-3 animate-pulse" style="animation-duration: 2s;">Chargement de la mosaïque</h2>
          <p class="text-xl text-gray-200 mb-12">
            <span v-if="loadingTotal > 0">Préparation de {{ loadingTotal }} images...</span>
            <span v-else>Préparation de vos souvenirs...</span>
          </p>
          
          <!-- Animated progress bar - bigger and more colorful -->
          <div class="w-80 h-3 bg-white/20 rounded-full overflow-hidden mx-auto shadow-lg">
            <div 
              class="h-full bg-gradient-to-r from-purple-gradient-start via-pink-gradient-start to-purple-gradient-end animate-pulse transition-all duration-300" 
              style="width: 65%; animation-duration: 1s;"
            ></div>
          </div>
          
          <!-- Dots animation below -->
          <div class="flex justify-center gap-2 mt-8">
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0s;"></div>
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.2s;"></div>
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0.4s;"></div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Header -->
    <div class="fixed top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4 md:p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">📷 Notre Galerie</h1>
        </div>
        <!-- Zoom controls -->
        <div v-if="!loading && photos.length > 0" class="flex gap-2">
          <button
            @click="zoomOut"
            class="p-2 md:p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-bold text-lg"
            title="Dézoomer"
          >
            −
          </button>
          <button
            @click="resetZoom"
            class="px-3 md:px-4 py-2 md:py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            title="Réinitialiser"
          >
            {{ Math.round(zoomLevel * 100) }}%
          </button>
          <button
            @click="zoomIn"
            class="p-2 md:p-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-bold text-lg"
            title="Zoomer"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- Gallery mosaic with pan & zoom -->
    <div
      v-if="!loading && photos.length > 0"
      class="w-full h-screen overflow-hidden select-none pt-24 pan-zoom-container"
      :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div
        ref="mosaicContainer"
        class="w-full h-full"
        :style="{
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoomLevel})`,
          transformOrigin: '0 0',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }"
      >
        <!-- Mosaic columns -->
        <div class="flex gap-1 h-full" :style="{ width: totalMosaicWidth + 'px' }">
          <div
            v-for="(column, colIndex) in columns"
            :key="colIndex"
            class="flex flex-col gap-1"
            :style="{ width: columnWidth + 'px', flex: '0 0 auto' }"
          >
            <div
              v-for="photo in column"
              :key="photo.uniqueKey || `${photo.album}-${photo.filename}`"
              class="relative overflow-hidden rounded-md shadow-sm hover:shadow-xl transition-shadow duration-200 group"
              :class="isPanning ? 'cursor-grabbing' : 'cursor-pointer'"
              :style="{ height: photo.displayHeight + 'px', flex: '0 0 auto' }"
              @click="handlePhotoClick(getPhotoIndex(photo), $event)"
            >
              <img
                :src="photo.thumbnail"
                :alt="photo.filename"
                class="w-full h-full object-cover object-center"
                loading="lazy"
                draggable="false"
                @error="handleImageError($event, photo)"
              />
              <!-- Overlay on hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 from-0% via-transparent via-50% to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-1.5">
                <p class="text-white text-[10px] font-medium truncate">{{ formatAlbumName(photo.album) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pan hint -->
      <div v-if="!panStarted && zoomLevel > 1" class="fixed bottom-4 left-4 bg-black/60 text-white text-xs rounded-lg p-3 pointer-events-none">
        Glissez pour naviguer • Molette pour zoomer
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="flex items-center justify-center min-h-screen p-8">
      <div class="text-center max-w-md">
        <div class="text-6xl mb-4">
          {{ loadingErrors.length > 0 ? '⚠️' : '📸' }}
        </div>
        <p class="text-lg text-white mb-4">
          {{ loadingErrors.length > 0 ? 'Erreur de chargement' : 'Aucune photo disponible' }}
        </p>
        <div v-if="loadingErrors.length > 0" class="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-sm text-white text-left">
          <p class="font-semibold mb-2">Détails de l'erreur :</p>
          <ul class="list-disc list-inside space-y-1">
            <li v-for="(error, index) in loadingErrors" :key="index">{{ error }}</li>
          </ul>
          <button 
            @click="loadPhotos" 
            class="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 w-full"
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'
import { usePhotoGallery } from '../composables/usePhotoGallery'
import { useMosaicLayout } from '../composables/useMosaicLayout'
import { usePanZoom } from '../composables/usePanZoom'

const mosaicContainer = ref(null)

// Use photo gallery composable
const {
  loading,
  photos,
  loadingTotal,
  loadingErrors,
  loadPhotos,
  formatAlbumName,
  handleImageError,
  getPhotoIndex
} = usePhotoGallery()

// Use mosaic layout composable
const {
  columns,
  columnWidth,
  totalMosaicWidth,
  averageColumnHeight
} = useMosaicLayout(photos)

// Calculate minimum zoom to cover screen
const minZoom = computed(() => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight - 100
  const mosaicWidth = totalMosaicWidth.value
  
  const zoomX = screenWidth / mosaicWidth
  const zoomY = screenHeight / averageColumnHeight.value
  
  return Math.max(zoomX, zoomY, 0.5)
})

// Use pan/zoom composable
const {
  panX,
  panY,
  zoomLevel,
  isPanning,
  panStarted,
  startPan,
  pan,
  endPan,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleWheel,
  zoomIn,
  zoomOut,
  resetZoom,
  centerMosaic,
  hasMovedDuringPan,
  resetHasMoved
} = usePanZoom({
  minZoom,
  maxZoom: 4,
  totalWidth: totalMosaicWidth,
  averageHeight: averageColumnHeight
})

/**
 * Handle photo click (only if not dragging)
 */
const handlePhotoClick = (index, event) => {
  if (hasMovedDuringPan()) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  openLightbox(index)
}

/**
 * Open PhotoSwipe lightbox
 */
const openLightbox = (index) => {
  const items = photos.value.map(photo => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    msrc: photo.thumbnail,
    alt: formatAlbumName(photo.album)
  }))

  const options = {
    index,
    dataSource: items,
    loop: true,
    bgOpacity: 1,
    pinchToClose: true,
    closeOnVerticalDrag: true,
    zoom: true,
    padding: { top: 20, bottom: 20, left: 20, right: 20 },
    imageClickAction: 'zoom',
    tapAction: 'toggle-controls',
    showHideAnimationType: 'fade'
  }

  const pswp = new PhotoSwipe(options)
  pswp.init()
}

// Load photos and center mosaic on mount
onMounted(async () => {
  await loadPhotos()
  await nextTick()
  centerMosaic()
})
</script>

<style scoped>
/* Smooth fade out transition for loader */
.fade-loader-enter-active,
.fade-loader-leave-active {
  transition: opacity 0.6s ease-in-out;
}

.fade-loader-enter-from {
  opacity: 1;
}

.fade-loader-enter-to {
  opacity: 1;
}

.fade-loader-leave-from {
  opacity: 1;
}

.fade-loader-leave-to {
  opacity: 0;
}

/* Pan & zoom container with proper touch handling */
.pan-zoom-container {
  touch-action: pan-x pan-y pinch-zoom;
}

/* Hardware acceleration for image containers */
img {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
