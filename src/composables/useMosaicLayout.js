import { computed } from 'vue'

/**
 * Composable for mosaic layout computation
 * Handles column distribution and photo sizing
 */
export function useMosaicLayout(photos, options = {}) {
  const {
    columnWidth = 250,
    minImageHeight = 150,
    maxImageHeight = 300,
    gap = 4
  } = options

  // Mosaic configuration
  const columnCount = Math.max(12, Math.ceil(window.innerWidth / columnWidth))
  const totalMosaicWidth = computed(() => columnWidth * columnCount + (columnCount - 1) * gap)

  // Dynamic tile repeat based on photo count
  const tileRepeat = computed(() => {
    const photoCount = photos.value.length
    if (photoCount < 300) return 8
    if (photoCount < 600) return 6
    if (photoCount < 1000) return 5
    return 4
  })

  /**
   * Shuffle array using Fisher-Yates algorithm
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
   * Build mosaic columns with repetition for infinite feel
   */
  const columns = computed(() => {
    const cols = Array.from({ length: columnCount }, () => [])
    
    // Shuffle photos randomly
    const shuffledPhotos = shuffleArray(photos.value)
    
    // Repeat photos according to dynamic factor
    const repeatedPhotos = []
    const fullRepeats = Math.floor(tileRepeat.value)
    const partialRepeat = tileRepeat.value % 1
    
    // Full repeats
    for (let i = 0; i < fullRepeats; i++) {
      repeatedPhotos.push(...shuffledPhotos)
    }
    
    // Partial repeat if needed
    if (partialRepeat > 0) {
      const partialCount = Math.floor(shuffledPhotos.length * partialRepeat)
      repeatedPhotos.push(...shuffledPhotos.slice(0, partialCount))
    }
    
    repeatedPhotos.forEach((photo, index) => {
      // Find shortest column
      let shortestCol = 0
      let shortestHeight = Infinity
      
      cols.forEach((col, idx) => {
        const height = col.reduce((sum, p) => sum + p.displayHeight + gap, 0)
        if (height < shortestHeight) {
          shortestHeight = height
          shortestCol = idx
        }
      })
      
      // Calculate random display height
      const baseHeight = minImageHeight + (Math.random() * (maxImageHeight - minImageHeight))
      const photoWithHeight = {
        ...photo,
        displayHeight: Math.round(baseHeight),
        uniqueKey: `${photo.album}-${photo.filename}-${index}`
      }
      
      cols[shortestCol].push(photoWithHeight)
    })
    
    return cols
  })

  /**
   * Calculate average column height for pan constraints
   */
  const averageColumnHeight = computed(() => {
    if (columns.value.length === 0) return window.innerHeight - 100
    return columns.value.reduce((sum, col) => 
      sum + col.reduce((s, p) => s + p.displayHeight + gap, 0), 0
    ) / columns.value.length
  })

  return {
    columns,
    columnWidth,
    columnCount,
    totalMosaicWidth,
    averageColumnHeight
  }
}
