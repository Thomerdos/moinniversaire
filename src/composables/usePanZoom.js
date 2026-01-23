import { ref, computed } from 'vue'
import { useRafFn } from '@vueuse/core'

/**
 * Composable for pan and zoom functionality
 * Handles mouse, touch, and wheel interactions for smooth panning and zooming
 */
export function usePanZoom(options = {}) {
  const {
    minZoom = 0.5,
    maxZoom = 4,
    totalWidth = ref(0),
    averageHeight = ref(0)
  } = options

  // Pan & Zoom state
  const panX = ref(0)
  const panY = ref(0)
  const zoomLevel = ref(1)
  const isPanning = ref(false)
  const panStarted = ref(false)
  
  // Internal state
  let panStartX = 0
  let panStartY = 0
  let hasMoved = false
  let currentMouseX = null // null means no mouse input
  let currentMouseY = null
  let currentTouchX = null // null means no touch input
  let currentTouchY = null
  let touchStartX = 0
  let touchStartY = 0
  let touchStartDistance = 0
  let lastTouchEnd = 0
  let cachedTouchRect = null
  
  // Cache for expensive calculations
  let cachedAvgColumnHeight = 0
  let cachedScreenWidth = 0
  let cachedScreenHeight = 0

  // Use VueUse's useRafFn for smooth animation loop
  const { pause: pauseAnimation, resume: resumeAnimation } = useRafFn(() => {
    if (!isPanning.value) return
    
    // Use current position - prioritize the active input method
    // Mouse input takes precedence if available (not null)
    const currentX = currentMouseX !== null ? currentMouseX : (currentTouchX ?? 0)
    const currentY = currentMouseY !== null ? currentMouseY : (currentTouchY ?? 0)
    
    const deltaX = currentX - panStartX
    const deltaY = currentY - panStartY
    
    // Detect if user has moved (more than 5px)
    if (Math.abs(deltaX - panX.value) > 5 || Math.abs(deltaY - panY.value) > 5) {
      hasMoved = true
    }
    
    // Apply pan constraints
    const constrained = constrainPan(deltaX, deltaY)
    panX.value = constrained.x
    panY.value = constrained.y
  }, { immediate: false })

  /**
   * Update dimension cache (called once at pan start)
   */
  const updateDimensionsCache = () => {
    cachedScreenWidth = window.innerWidth
    cachedScreenHeight = window.innerHeight - 100
    cachedAvgColumnHeight = averageHeight.value
  }

  /**
   * Constrain pan to mosaic bounds (optimized with cache)
   */
  const constrainPan = (x, y) => {
    const mosaicWidth = totalWidth.value * zoomLevel.value
    const mosaicHeight = cachedAvgColumnHeight * zoomLevel.value
    
    // Limits: prevent seeing edges
    const maxX = 0
    const minX = cachedScreenWidth - mosaicWidth
    const maxY = 100 // Header height
    const minY = cachedScreenHeight - mosaicHeight + 100
    
    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y))
    }
  }

  /**
   * Mouse pan handlers
   */
  const startPan = (e) => {
    if (e.button !== 0) return // Only left mouse button
    isPanning.value = true
    panStarted.value = true
    hasMoved = false
    panStartX = e.clientX - panX.value
    panStartY = e.clientY - panY.value
    currentMouseX = e.clientX
    currentMouseY = e.clientY
    
    updateDimensionsCache()
    resumeAnimation()
    e.preventDefault()
  }

  const pan = (e) => {
    if (!isPanning.value) return
    currentMouseX = e.clientX
    currentMouseY = e.clientY
  }

  const endPan = () => {
    isPanning.value = false
    pauseAnimation()
  }

  /**
   * Touch handlers for mobile
   */
  const handleTouchStart = (e) => {
    // Cache the bounding rect once at the start
    cachedTouchRect = e.currentTarget.getBoundingClientRect()
    
    if (e.touches.length === 1) {
      // Single finger: pan
      isPanning.value = true
      panStarted.value = true
      hasMoved = false
      touchStartX = e.touches[0].clientX - panX.value
      touchStartY = e.touches[0].clientY - panY.value
      currentTouchX = e.touches[0].clientX
      currentTouchY = e.touches[0].clientY
      
      updateDimensionsCache()
      resumeAnimation()
    } else if (e.touches.length === 2) {
      // Two fingers: pinch-to-zoom
      isPanning.value = false
      pauseAnimation()
      
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchStartDistance = Math.sqrt(dx * dx + dy * dy)
      e.preventDefault()
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isPanning.value) {
      // Pan with one finger
      currentTouchX = e.touches[0].clientX
      currentTouchY = e.touches[0].clientY
      e.preventDefault()
    } else if (e.touches.length === 2 && cachedTouchRect) {
      // Pinch-to-zoom with two fingers - only if we have a valid cached rect
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (touchStartDistance > 0) {
        const scale = distance / touchStartDistance
        const oldZoom = zoomLevel.value
        zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, oldZoom * scale))
        
        // Center zoom between the two fingers
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2
        
        updateDimensionsCache()
        
        const rect = cachedTouchRect
        const mouseX = centerX - rect.left - panX.value
        const mouseY = centerY - rect.top - panY.value
        
        const zoomDiff = zoomLevel.value / oldZoom
        let newPanX = centerX - rect.left - mouseX * zoomDiff
        let newPanY = centerY - rect.top - mouseY * zoomDiff
        
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
    isPanning.value = false
    pauseAnimation()
    cachedTouchRect = null
    
    // Detect double-tap for zoom
    const now = Date.now()
    if (now - lastTouchEnd < 300 && !hasMoved) {
      if (zoomLevel.value > 1.5) {
        // Zoom out
        zoomLevel.value = Math.max(1, minZoom)
        panX.value = 0
        panY.value = 0
      } else {
        // Zoom in to tapped point
        const touch = e.changedTouches[0]
        const rect = e.currentTarget.getBoundingClientRect()
        const centerX = touch.clientX - rect.left
        const centerY = touch.clientY - rect.top
        
        const oldZoom = zoomLevel.value
        zoomLevel.value = 2.5
        
        updateDimensionsCache()
        
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
    touchStartDistance = 0
  }

  /**
   * Mouse wheel zoom handler
   */
  const handleWheel = (e) => {
    e.preventDefault()
    
    const zoomSpeed = 0.15
    const oldZoom = zoomLevel.value
    
    if (e.deltaY < 0) {
      zoomLevel.value = Math.min(zoomLevel.value + zoomSpeed, maxZoom)
    } else {
      zoomLevel.value = Math.max(zoomLevel.value - zoomSpeed, minZoom)
    }
    
    updateDimensionsCache()
    
    // Adjust position to zoom towards cursor
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left - panX.value
    const mouseY = e.clientY - rect.top - panY.value
    
    const zoomDiff = zoomLevel.value / oldZoom
    let newPanX = e.clientX - rect.left - mouseX * zoomDiff
    let newPanY = e.clientY - rect.top - mouseY * zoomDiff
    
    const constrained = constrainPan(newPanX, newPanY)
    panX.value = constrained.x
    panY.value = constrained.y
  }

  /**
   * Zoom controls
   */
  const zoomIn = () => {
    zoomLevel.value = Math.min(zoomLevel.value + 0.3, maxZoom)
    updateDimensionsCache()
  }

  const zoomOut = () => {
    zoomLevel.value = Math.max(zoomLevel.value - 0.3, minZoom)
    updateDimensionsCache()
    const constrained = constrainPan(panX.value, panY.value)
    panX.value = constrained.x
    panY.value = constrained.y
  }

  const resetZoom = () => {
    zoomLevel.value = Math.max(1, minZoom)
    panX.value = 0
    panY.value = 0
  }

  /**
   * Center the mosaic horizontally
   */
  const centerMosaic = () => {
    const screenWidth = window.innerWidth
    const mosaicWidth = totalWidth.value * zoomLevel.value
    
    // Center horizontally - the mosaic is always larger than screen
    panX.value = (screenWidth - mosaicWidth) / 2
    panY.value = 0
  }

  /**
   * Check if user has moved (for click vs drag detection)
   */
  const hasMovedDuringPan = () => hasMoved

  /**
   * Reset has moved flag
   */
  const resetHasMoved = () => {
    hasMoved = false
  }

  return {
    // State
    panX,
    panY,
    zoomLevel,
    isPanning,
    panStarted,
    
    // Mouse handlers
    startPan,
    pan,
    endPan,
    
    // Touch handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // Wheel handler
    handleWheel,
    
    // Zoom controls
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Utilities
    centerMosaic,
    hasMovedDuringPan,
    resetHasMoved,
    updateDimensionsCache
  }
}
