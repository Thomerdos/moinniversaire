<template>
  <div class="text-center p-12 bg-white/95 rounded-[30px] shadow-2xl max-w-lg w-[90%] animate-fade-in">
    <div class="text-[6rem] mb-6 animate-bounce-slow">💑</div>
    <h1 class="text-4xl mb-4 text-gray-800">Depuis combien de temps ?</h1>
    
    <div v-if="hasStarted" class="space-y-6">
      <div class="text-5xl font-bold my-6 text-purple-gradient-start">
        {{ totalTime }}
      </div>
      
      <div class="text-xl text-gray-600">
        Début de notre histoire : <br>
        <span class="font-bold">{{ startDateFormatted }}</span>
      </div>
      
      <div class="grid grid-cols-2 gap-4 mt-6">
        <div class="bg-gradient-to-br from-purple-gradient-start to-purple-gradient-end p-4 rounded-2xl text-white">
          <div class="text-3xl font-bold">{{ yearsTogether }}</div>
          <div class="text-sm">An{{ yearsTogether > 1 ? 's' : '' }}</div>
        </div>
        <div class="bg-gradient-to-br from-pink-gradient-start to-pink-gradient-end p-4 rounded-2xl text-white">
          <div class="text-3xl font-bold">{{ monthsTogether }}</div>
          <div class="text-sm">Mois</div>
        </div>
        <div class="bg-gradient-to-br from-peach-gradient-start to-peach-gradient-end p-4 rounded-2xl text-white">
          <div class="text-3xl font-bold">{{ weeksTogether }}</div>
          <div class="text-sm">Semaine{{ weeksTogether > 1 ? 's' : '' }}</div>
        </div>
        <div class="bg-gradient-to-br from-purple-gradient-end to-pink-gradient-start p-4 rounded-2xl text-white">
          <div class="text-3xl font-bold">{{ daysTogether }}</div>
          <div class="text-sm">Jour{{ daysTogether > 1 ? 's' : '' }}</div>
        </div>
      </div>
      
      <div class="mt-8 p-6 rounded-2xl text-lg font-bold text-red-600 animate-pulse-slow bg-gradient-to-br from-peach-gradient-start/20 to-peach-gradient-end/20">
        <div class="text-2xl my-2">💕 💖 💕</div>
        <div>Ensemble depuis {{ totalTimeDetailed }}</div>
        <div class="text-2xl my-2">💕 💖 💕</div>
      </div>
    </div>
    
    <div v-else class="space-y-6">
      <div class="text-2xl text-gray-600 my-6">
        Notre histoire commence le <br>
        <span class="font-bold text-3xl text-purple-gradient-start">{{ startDateFormatted }}</span>
      </div>
      <div class="text-xl text-gray-500">
        {{ daysUntilStart }} jour{{ daysUntilStart > 1 ? 's' : '' }} avant le grand jour ! 💕
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrentDate } from '../composables/useCurrentDate'
import { COUPLE_START_DATE } from '../constants'

const { now } = useCurrentDate()

const hasStarted = computed(() => now.value >= COUPLE_START_DATE)

const startDateFormatted = computed(() => 
  COUPLE_START_DATE.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
)

const daysTogether = computed(() => {
  if (!hasStarted.value) return 0
  const diff = now.value - COUPLE_START_DATE
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const weeksTogether = computed(() => {
  return Math.floor(daysTogether.value / 7)
})

const monthsTogether = computed(() => {
  if (!hasStarted.value) return 0
  
  const yearsDiff = now.value.getFullYear() - COUPLE_START_DATE.getFullYear()
  const monthsDiff = now.value.getMonth() - COUPLE_START_DATE.getMonth()
  const daysDiff = now.value.getDate() - COUPLE_START_DATE.getDate()
  
  // Calculate total months, accounting for incomplete months
  let totalMonths = yearsDiff * 12 + monthsDiff
  
  // If we haven't reached the day yet in the current month, subtract one month
  if (daysDiff < 0) {
    totalMonths--
  }
  
  return Math.max(0, totalMonths)
})

const yearsTogether = computed(() => {
  if (!hasStarted.value) return 0
  return Math.floor(monthsTogether.value / 12)
})

const totalTime = computed(() => {
  if (!hasStarted.value) return ''
  
  const years = yearsTogether.value
  const months = monthsTogether.value % 12
  
  if (years === 0 && months === 0) {
    return `${daysTogether.value} jour${daysTogether.value > 1 ? 's' : ''}`
  } else if (years === 0) {
    return `${months} mois`
  } else if (months === 0) {
    return `${years} an${years > 1 ? 's' : ''}`
  } else {
    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
  }
})

const totalTimeDetailed = computed(() => {
  if (!hasStarted.value) return ''
  
  const years = yearsTogether.value
  const months = monthsTogether.value % 12
  const days = daysTogether.value
  
  const parts = []
  if (years > 0) parts.push(`${years} an${years > 1 ? 's' : ''}`)
  if (months > 0) parts.push(`${months} mois`)
  parts.push(`${days} jour${days > 1 ? 's' : ''}`)
  
  return parts.join(', ')
})

const daysUntilStart = computed(() => {
  if (hasStarted.value) return 0
  const diff = COUPLE_START_DATE - now.value
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})
</script>
