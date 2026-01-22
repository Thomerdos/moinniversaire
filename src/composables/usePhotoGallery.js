import { ref } from 'vue'

/**
 * Composable for loading photos from the server
 * Handles fetching, validation, and error states
 */
export function usePhotoGallery() {
  const loading = ref(true)
  const photos = ref([])
  const loadingTotal = ref(0)
  const loadingErrors = ref([])

  /**
   * Validate image loading with timeout
   */
  const validateImage = (src, timeout = 3000) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timer = setTimeout(() => {
        img.src = ''
        reject(new Error(`Timeout loading ${src}`))
      }, timeout)
      
      img.onload = () => {
        clearTimeout(timer)
        resolve()
      }
      
      img.onerror = () => {
        clearTimeout(timer)
        reject(new Error(`Error loading ${src}`))
      }
      
      img.src = src
    })
  }

  /**
   * Validate sample of thumbnails
   */
  const validateThumbnails = async (photoList) => {
    const sampleSize = Math.min(10, photoList.length)
    const samples = []
    
    for (let i = 0; i < sampleSize; i++) {
      const randomIndex = Math.floor(Math.random() * photoList.length)
      samples.push(photoList[randomIndex])
    }
    
    const validationPromises = samples.map(photo => 
      validateImage(photo.thumbnail, 3000)
    )
    
    try {
      await Promise.allSettled(validationPromises)
    } catch (error) {
      console.warn('Some thumbnails could not be validated:', error)
    }
  }

  /**
   * Load photos from JSON data file
   */
  const loadPhotos = async () => {
    try {
      loading.value = true
      loadingErrors.value = []
      
      const baseUrl = import.meta.env.BASE_URL
      const response = await fetch(`${baseUrl}photos/photos-data.json`)
      
      if (!response.ok) {
        throw new Error(`Cannot load photo list: ${response.status}`)
      }
      
      const photosData = await response.json()
      const allPhotos = []
      
      // Count total images
      loadingTotal.value = Object.values(photosData).reduce(
        (sum, album) => sum + album.length, 0
      )
      
      // Create photo objects with dimensions from JSON
      for (const [album, photoList] of Object.entries(photosData)) {
        for (const photoData of photoList) {
          // Handle both formats: old (string) and new (object with dimensions)
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
      
      // Validate thumbnails exist
      await validateThumbnails(allPhotos)
      
      photos.value = allPhotos
    } catch (error) {
      console.error('Error loading photos:', error)
      if (loadingErrors.value.length === 0) {
        loadingErrors.value.push(`Error: ${error.message}`)
      }
      // Fallback: try manual load after delay
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
   * Fallback: manually load photos if JSON unavailable
   */
  const loadPhotosManually = async () => {
    console.warn('Fallback: Attempting manual photo load')
    const baseUrl = import.meta.env.BASE_URL
    
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
      console.log('✅ Fallback successful: photos loaded')
    } catch (error) {
      console.error('❌ Fallback failed:', error)
      photos.value = []
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
    
    // Avoid infinite loops
    if (img.dataset.errorHandled) return
    img.dataset.errorHandled = 'true'
    
    // Replace with background color and emoji
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
    
    console.warn(`Unable to load image: ${photo.thumbnail}`)
  }

  /**
   * Get photo index in full array
   */
  const getPhotoIndex = (photo) => {
    return photos.value.findIndex(
      p => p.filename === photo.filename && p.album === photo.album
    )
  }

  return {
    loading,
    photos,
    loadingTotal,
    loadingErrors,
    loadPhotos,
    formatAlbumName,
    handleImageError,
    getPhotoIndex
  }
}
