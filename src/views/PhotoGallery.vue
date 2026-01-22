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
            <span v-if="loadingTotal > 0">{{ loadingProgress }} / {{ loadingTotal }} images chargées</span>
            <span v-else>Préparation de vos souvenirs...</span>
          </p>
          
          <!-- Animated progress bar - bigger and more colorful -->
          <div class="w-80 h-3 bg-white/20 rounded-full overflow-hidden mx-auto shadow-lg">
            <div 
              class="h-full bg-gradient-to-r from-purple-gradient-start via-pink-gradient-start to-purple-gradient-end transition-all duration-300" 
              :style="{ width: loadingTotal > 0 ? `${(loadingProgress / loadingTotal) * 100}%` : '65%' }"
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
      class="w-full h-screen overflow-hidden select-none pt-24"
      style="touch-action: none;"
      :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel="handleWheel"
      @touchstart.passive="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend.passive="handleTouchEnd"
    >
      <div
        ref="mosaicContainer"
        class="w-full h-full"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
          willChange: 'transform'
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
import { ref, computed, onMounted } from 'vue'
import PhotoSwipe from 'photoswipe'
import 'photoswipe/style.css'

const loading = ref(true)
const photos = ref([])
const mosaicContainer = ref(null)
const loadingProgress = ref(0)
const loadingTotal = ref(0)
const loadingErrors = ref([])

// Pan & Zoom state
const panX = ref(0)
const panY = ref(0)
const zoomLevel = ref(1)
const isPanning = ref(false)
let panStartX = 0
let panStartY = 0
let hasMoved = false

// Calculer le zoom minimum pour toujours couvrir l'écran
const minZoom = computed(() => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight - 100 // -100px pour l'header
  const mosaicWidth = totalMosaicWidth.value
  
  // Calculer approximativement la hauteur de la mosaïque (hauteur moyenne des colonnes)
  const avgColumnHeight = columns.value.length > 0 
    ? columns.value.reduce((sum, col) => sum + col.reduce((s, p) => s + p.displayHeight + 4, 0), 0) / columns.value.length
    : screenHeight
  
  // Zoom minimum = ratio pour que la mosaïque couvre tout l'écran
  const zoomX = screenWidth / mosaicWidth
  const zoomY = screenHeight / avgColumnHeight
  
  return Math.max(zoomX, zoomY, 0.5) // Minimum 0.5 pour permettre beaucoup de navigation
})

// Touch support
let touchStartX = 0
let touchStartY = 0
let touchStartDistance = 0
let lastTouchEnd = 0

// Mosaic configuration - grille dense et compacte
const columnWidth = 250 // Réduit pour plus de densité
const columnCount = Math.max(12, Math.ceil(window.innerWidth / columnWidth)) // Plus de colonnes
const totalMosaicWidth = computed(() => columnWidth * columnCount + (columnCount - 1) * 4) // Gaps réduits
const minImageHeight = 150 // Images plus petites
const maxImageHeight = 300 // Hauteur max réduite

// Nombre de répétitions dynamique selon le nombre d'images (massivement augmenté)
const tileRepeat = computed(() => {
  const photoCount = photos.value.length
  if (photoCount < 300) return 8 // Peu d'images: répéter 8x
  if (photoCount < 600) return 6 // Moyen: répéter 6x
  if (photoCount < 1000) return 5 // Beaucoup: répéter 5x
  return 4 // Énormément d'images: répéter 4x minimum
})

/**
 * Mélanger un tableau de manière aléatoire (Fisher-Yates shuffle)
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Build mosaic columns avec effet de répétition pour impression d'infinité
 */
const columns = computed(() => {
  const cols = Array.from({ length: columnCount }, () => [])
  
  // Mélanger les photos aléatoirement
  const shuffledPhotos = shuffleArray(photos.value)
  
  // Répéter les photos selon le facteur dynamique
  const repeatedPhotos = []
  const fullRepeats = Math.floor(tileRepeat.value)
  const partialRepeat = tileRepeat.value % 1
  
  // Répétitions complètes
  for (let i = 0; i < fullRepeats; i++) {
    repeatedPhotos.push(...shuffledPhotos)
  }
  
  // Répétition partielle si nécessaire (ex: 1.5x = 1 complète + 50% des photos)
  if (partialRepeat > 0) {
    const partialCount = Math.floor(shuffledPhotos.length * partialRepeat)
    repeatedPhotos.push(...shuffledPhotos.slice(0, partialCount))
  }
  
  repeatedPhotos.forEach((photo, index) => {
    // Trouver la colonne la plus courte
    let shortestCol = 0
    let shortestHeight = Infinity
    
    cols.forEach((col, idx) => {
      const height = col.reduce((sum, p) => sum + p.displayHeight + 4, 0) // Gaps réduits
      if (height < shortestHeight) {
        shortestHeight = height
        shortestCol = idx
      }
    })
    
    // Calculer la hauteur d'affichage aléatoire
    const baseHeight = minImageHeight + (Math.random() * (maxImageHeight - minImageHeight))
    const photoWithHeight = {
      ...photo,
      displayHeight: Math.round(baseHeight),
      uniqueKey: `${photo.album}-${photo.filename}-${index}` // Clé unique pour les répétitions
    }
    
    cols[shortestCol].push(photoWithHeight)
  })
  
  return cols
})

/**
 * Load all images from the img folder
 * Récupère la liste des images depuis le serveur
 */
const loadPhotos = async () => {
  try {
    loading.value = true
    loadingProgress.value = 0
    loadingErrors.value = []
    
    // Charger la liste des images depuis le JSON
    const baseUrl = import.meta.env.BASE_URL
    const response = await fetch(`${baseUrl}photos/photos-data.json`)
    
    if (!response.ok) {
      throw new Error(`Impossible de charger la liste des photos: ${response.status}`)
    }
    
    const photosData = await response.json()
    
    const allPhotos = []
    
    // Compter le nombre total d'images pour la barre de progression
    loadingTotal.value = Object.values(photosData).reduce((sum, album) => sum + album.length, 0)
    
    // Créer les objets photo avec les dimensions depuis le JSON
    for (const [album, photoList] of Object.entries(photosData)) {
      for (const photoData of photoList) {
        // Gérer les deux formats: ancien (string) et nouveau (objet avec dimensions)
        const filename = typeof photoData === 'string' ? photoData : photoData.filename
        const width = typeof photoData === 'string' ? 1920 : photoData.width
        const height = typeof photoData === 'string' ? 1440 : photoData.height
        
        allPhotos.push({
          filename,
          album,
          src: `${baseUrl}photos/${album}/${filename}`,
          thumbnail: `${baseUrl}photos/thumbs/${album}/${filename}`,
          width,
          height
        })
        
        loadingProgress.value++
      }
    }
    
    // Valider que les images existent en chargeant les miniatures avec timeout
    await validateThumbnails(allPhotos)
    
    photos.value = allPhotos
  } catch (error) {
    console.error('Erreur lors du chargement des photos:', error)
    // Afficher l'erreur à l'utilisateur
    if (loadingErrors.value.length === 0) {
      loadingErrors.value.push(`Erreur: ${error.message}`)
    }
    // Fallback: essayer de charger manuellement après un délai
    setTimeout(() => {
      if (photos.value.length === 0) {
        loadPhotosManually()
      }
    }, 2000)
  } finally {
    loading.value = false
  }
}

/**
 * Valider que les miniatures existent en chargeant quelques-unes
 * (ne charge pas toutes pour éviter de surcharger le navigateur)
 */
const validateThumbnails = async (photoList) => {
  // Valider un échantillon aléatoire de miniatures
  const sampleSize = Math.min(10, photoList.length)
  const samples = []
  
  for (let i = 0; i < sampleSize; i++) {
    const randomIndex = Math.floor(Math.random() * photoList.length)
    samples.push(photoList[randomIndex])
  }
  
  const validationPromises = samples.map(photo => 
    validateImage(photo.thumbnail, 3000) // timeout de 3 secondes
  )
  
  try {
    await Promise.allSettled(validationPromises)
  } catch (error) {
    console.warn('Certaines miniatures n\'ont pas pu être validées:', error)
  }
}

/**
 * Valider qu'une image peut être chargée avec timeout
 */
const validateImage = (src, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timer = setTimeout(() => {
      img.src = '' // Annuler le chargement
      reject(new Error(`Timeout lors du chargement de ${src}`))
    }, timeout)
    
    img.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    
    img.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Erreur lors du chargement de ${src}`))
    }
    
    img.src = src
  })
}

/**
 * Fallback: charger les images manuellement si JSON indisponible
 * Cette fonction est maintenant simplifiée car les dimensions sont dans le JSON
 */
const loadPhotosManually = async () => {
  console.warn('Fallback: Tentative de chargement manuel des photos')
  const baseUrl = import.meta.env.BASE_URL
  
  // Essayer de recharger le JSON une dernière fois
  try {
    const response = await fetch(`${baseUrl}photos/photos-data.json`)
    const photosData = await response.json()
    
    const allPhotos = []
    for (const [album, photoList] of Object.entries(photosData)) {
      for (const photoData of photoList) {
        const filename = typeof photoData === 'string' ? photoData : photoData.filename
        const width = typeof photoData === 'string' ? 1920 : photoData.width
        const height = typeof photoData === 'string' ? 1440 : photoData.height
        
        allPhotos.push({
          filename,
          album,
          src: `${baseUrl}photos/${album}/${filename}`,
          thumbnail: `${baseUrl}photos/thumbs/${album}/${filename}`,
          width,
          height
        })
      }
    }
    
    photos.value = allPhotos
    console.log('✅ Fallback réussi: photos chargées')
  } catch (error) {
    console.error('❌ Fallback échoué:', error)
    photos.value = [] // Afficher l'état vide
  }
}

/**
 * Format album name for display (slug → Title Case)
 */
const formatAlbumName = (album) => {
  return album
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Handle image loading errors
 */
const handleImageError = (event, photo) => {
  const img = event.target
  
  // Éviter les boucles infinies
  if (img.dataset.errorHandled) return
  img.dataset.errorHandled = 'true'
  
  // Remplacer par une couleur de fond et un emoji
  img.style.display = 'none'
  const parent = img.parentElement
  if (parent) {
    parent.style.backgroundColor = '#e5e7eb'
    parent.style.display = 'flex'
    parent.style.alignItems = 'center'
    parent.style.justifyContent = 'center'
    
    const placeholder = document.createElement('div')
    placeholder.className = 'text-4xl'
    placeholder.textContent = '🖼️'
    parent.appendChild(placeholder)
  }
  
  console.warn(`Impossible de charger l'image: ${photo.thumbnail}`)
}

/**
 * Get the index of a photo in the full photos array
 */
const getPhotoIndex = (photo) => {
  return photos.value.findIndex(p => p.filename === photo.filename && p.album === photo.album)
}

/**
 * Pan handling avec distinction clic/drag
 */
const startPan = (e) => {
  if (e.button !== 0) return // Only left mouse button
  isPanning.value = true
  hasMoved = false
  panStartX = e.clientX - panX.value
  panStartY = e.clientY - panY.value
  e.preventDefault()
}

const pan = (e) => {
  if (!isPanning.value) return
  
  const deltaX = e.clientX - panStartX
  const deltaY = e.clientY - panStartY
  
  // Détecter si l'utilisateur a vraiment bougé (plus de 5px)
  if (Math.abs(deltaX - panX.value) > 5 || Math.abs(deltaY - panY.value) > 5) {
    hasMoved = true
  }
  
  // Appliquer les limites de pan
  panX.value = constrainPan(deltaX, deltaY).x
  panY.value = constrainPan(deltaX, deltaY).y
}

/**
 * Contraindre le pan aux limites de la mosaïque
 */
const constrainPan = (x, y) => {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight - 100
  const mosaicWidth = totalMosaicWidth.value * zoomLevel.value
  
  // Calculer hauteur moyenne des colonnes
  const avgColumnHeight = columns.value.length > 0 
    ? columns.value.reduce((sum, col) => sum + col.reduce((s, p) => s + p.displayHeight + 4, 0), 0) / columns.value.length
    : screenHeight
  const mosaicHeight = avgColumnHeight * zoomLevel.value
  
  // Limites: on ne peut pas voir de bord
  const maxX = 0
  const minX = screenWidth - mosaicWidth
  const maxY = 100 // Hauteur de l'header
  const minY = screenHeight - mosaicHeight + 100
  
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y))
  }
}

const endPan = () => {
  isPanning.value = false
}

/**
 * Touch support pour mobile avec pinch-to-zoom
 */
const handleTouchStart = (e) => {
  if (e.touches.length === 1) {
    // Un doigt: pan
    isPanning.value = true
    hasMoved = false
    touchStartX = e.touches[0].clientX - panX.value
    touchStartY = e.touches[0].clientY - panY.value
  } else if (e.touches.length === 2) {
    // Deux doigts: pinch-to-zoom
    isPanning.value = false
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    touchStartDistance = Math.sqrt(dx * dx + dy * dy)
    e.preventDefault()
  }
}

const handleTouchMove = (e) => {
  if (e.touches.length === 1 && isPanning.value) {
    // Pan avec un doigt
    const deltaX = e.touches[0].clientX - touchStartX
    const deltaY = e.touches[0].clientY - touchStartY
    
    if (Math.abs(deltaX - panX.value) > 5 || Math.abs(deltaY - panY.value) > 5) {
      hasMoved = true
    }
    
    // Appliquer les limites de pan
    const constrained = constrainPan(deltaX, deltaY)
    panX.value = constrained.x
    panY.value = constrained.y
    e.preventDefault()
  } else if (e.touches.length === 2) {
    // Pinch-to-zoom avec deux doigts
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (touchStartDistance > 0) {
      const scale = distance / touchStartDistance
      const oldZoom = zoomLevel.value
      zoomLevel.value = Math.max(minZoom.value, Math.min(4, oldZoom * scale))
      
      // Centrer le zoom entre les deux doigts
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      
      const rect = e.target.getBoundingClientRect()
      const mouseX = centerX - rect.left - panX.value
      const mouseY = centerY - rect.top - panY.value
      
      const zoomDiff = zoomLevel.value / oldZoom
      let newPanX = centerX - rect.left - mouseX * zoomDiff
      let newPanY = centerY - rect.top - mouseY * zoomDiff
      
      // Contraindre aux limites
      const constrained = constrainPan(newPanX, newPanY)
      panX.value = constrained.x
      panY.value = constrained.y
      
      touchStartDistance = distance
    }
    
    hasMoved = true
    e.preventDefault()
  }
}

const handleTouchEnd = (e) => {
  // Détecter double-tap pour zoom
  const now = Date.now()
  if (now - lastTouchEnd < 300 && !hasMoved) {
    // Double tap détecté: toggle zoom
    if (zoomLevel.value > 1.5) {
      // Dézoomer
      zoomLevel.value = Math.max(1, minZoom.value)
      panX.value = 0
      panY.value = 0
    } else {
      // Zoomer au point tapé
      const touch = e.changedTouches[0]
      const rect = e.target.getBoundingClientRect()
      const centerX = touch.clientX - rect.left
      const centerY = touch.clientY - rect.top
      
      const oldZoom = zoomLevel.value
      zoomLevel.value = 2.5
      
      const mouseX = centerX - panX.value
      const mouseY = centerY - panY.value
      
      const zoomDiff = zoomLevel.value / oldZoom
      let newPanX = centerX - mouseX * zoomDiff
      let newPanY = centerY - mouseY * zoomDiff
      
      const constrained = constrainPan(newPanX, newPanY)
      panX.value = constrained.x
      panY.value = constrained.y
    }
    e.preventDefault()
  }
  
  lastTouchEnd = now
  isPanning.value = false
  touchStartDistance = 0
}

/**
 * Gérer le clic sur une photo (seulement si pas de drag)
 */
const handlePhotoClick = (index, event) => {
  // Ne pas ouvrir si l'utilisateur était en train de faire un pan
  if (hasMoved) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  openLightbox(index)
}

/**
 * Zoom handling with mouse wheel
 */
const handleWheel = (e) => {
  e.preventDefault()
  
  const zoomSpeed = 0.15
  const oldZoom = zoomLevel.value
  
  if (e.deltaY < 0) {
    zoomLevel.value = Math.min(zoomLevel.value + zoomSpeed, 4)
  } else {
    zoomLevel.value = Math.max(zoomLevel.value - zoomSpeed, minZoom.value)
  }
  
  // Ajuster la position pour zoomer vers le curseur
  const rect = e.currentTarget.getBoundingClientRect()
  const mouseX = e.clientX - rect.left - panX.value
  const mouseY = e.clientY - rect.top - panY.value
  
  const zoomDiff = zoomLevel.value / oldZoom
  let newPanX = e.clientX - rect.left - mouseX * zoomDiff
  let newPanY = e.clientY - rect.top - mouseY * zoomDiff
  
  // Contraindre aux limites
  const constrained = constrainPan(newPanX, newPanY)
  panX.value = constrained.x
  panY.value = constrained.y
}

/**
 * Zoom in
 */
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.3, 4)
}

/**
 * Zoom out
 */
const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.3, minZoom.value)
  // Contraindre le pan après le zoom
  const constrained = constrainPan(panX.value, panY.value)
  panX.value = constrained.x
  panY.value = constrained.y
}

/**
 * Reset zoom and pan
 */
const resetZoom = () => {
  zoomLevel.value = Math.max(1, minZoom.value)
  panX.value = 0
  panY.value = 0
}

/**
 * Open PhotoSwipe lightbox avec dimensions réelles
 */
const openLightbox = (index) => {
  // Créer les items pour PhotoSwipe v5 avec dimensions réelles
  const items = photos.value.map(photo => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    msrc: photo.thumbnail,
    alt: formatAlbumName(photo.album)
  }))

  // Options PhotoSwipe v5
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

// Load photos when component mounts
onMounted(() => {
  loadPhotos()
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
</style>
