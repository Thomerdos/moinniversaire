<template>
  <div class="text-center p-12 bg-white/95 rounded-[30px] shadow-2xl max-w-lg w-[90%] animate-fade-in">
    <div class="text-[6rem] mb-6 animate-bounce-slow">{{ emoji }}</div>
    <h1 class="text-4xl mb-4 text-gray-800">Est-ce le 18 du mois ?</h1>
    <div class="text-5xl font-bold my-6" :class="is18 ? 'text-purple-gradient-start' : 'text-pink-gradient-end'">
      {{ response }}
    </div>
    <div class="text-xl text-gray-600 mt-6">{{ dateInfo }}</div>
    <div v-if="countdown" class="mt-4 text-base text-gray-500">{{ countdown }}</div>
    <AnniversaryDisplay 
      v-if="showAnniversary"
      :months-together="monthsTogether"
      :is-yearly-anniversary="isYearlyAnniversary"
      :years-together="yearsTogether"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AnniversaryDisplay from './components/AnniversaryDisplay.vue'

const COUPLE_START_DATE = new Date(2025, 6, 18) // 18 juillet 2025
const ANNIVERSARY_MONTH = 6 // Juillet (0-indexed)
const CHECK_INTERVAL_MS = 3600000 // 1 heure en millisecondes

const now = ref(new Date())
const interval = ref(null)

const day = computed(() => now.value.getDate())
const month = computed(() => now.value.getMonth())
const year = computed(() => now.value.getFullYear())
const is18 = computed(() => day.value === 18)

const monthName = computed(() => 
  now.value.toLocaleDateString('fr-FR', { month: 'long' })
)

const emoji = computed(() => is18.value ? '🎊' : '📆')

const response = computed(() => is18.value ? 'OUI ! 🎉' : 'Non 😔')

const dateInfo = computed(() => 
  `Nous sommes le ${day.value} ${monthName.value} ${year.value}`
)

const daysUntilNext18 = computed(() => {
  if (day.value < 18) {
    return 18 - day.value
  }
  
  const nextMonth = new Date(
    now.value.getFullYear(),
    now.value.getMonth() + 1,
    18
  )
  const diff = nextMonth - now.value
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const countdown = computed(() => {
  if (is18.value) return ''
  const days = daysUntilNext18.value
  return `Plus que ${days} jour${days > 1 ? 's' : ''} avant le prochain 18 !`
})

const monthsTogether = computed(() => {
  if (now.value < COUPLE_START_DATE) return 0
  const years = year.value - COUPLE_START_DATE.getFullYear()
  const months = month.value - COUPLE_START_DATE.getMonth()
  return years * 12 + months
})

const showAnniversary = computed(() => 
  is18.value && now.value >= COUPLE_START_DATE
)

const isYearlyAnniversary = computed(() => 
  month.value === ANNIVERSARY_MONTH && year.value >= COUPLE_START_DATE.getFullYear()
)

const yearsTogether = computed(() => year.value - COUPLE_START_DATE.getFullYear())

const updateBodyClass = () => {
  document.body.className = is18.value ? 'is-18' : 'not-18'
}

const updateDate = () => {
  now.value = new Date()
  updateBodyClass()
}

onMounted(() => {
  updateBodyClass()
  // Vérifier toutes les heures si la date a changé
  interval.value = setInterval(updateDate, CHECK_INTERVAL_MS)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>
