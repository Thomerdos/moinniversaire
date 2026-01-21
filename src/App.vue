<template>
  <div class="container">
    <div class="emoji">{{ emoji }}</div>
    <h1>Est-ce le 18 du mois ?</h1>
    <div class="response" :class="is18 ? 'is-18-text' : 'not-18-text'">
      {{ response }}
    </div>
    <div class="date-info">{{ dateInfo }}</div>
    <div class="countdown" v-if="countdown">{{ countdown }}</div>
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
  month.value === ANNIVERSARY_MONTH && year.value >= 2025
)

const yearsTogether = computed(() => year.value - 2025)

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
  interval.value = setInterval(updateDate, 3600000)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>

<style scoped>
.container {
  text-align: center;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji {
  font-size: 6rem;
  margin-bottom: 1.5rem;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.response {
  font-size: 3rem;
  font-weight: bold;
  margin: 1.5rem 0;
}

.is-18-text {
  color: #667eea;
}

.not-18-text {
  color: #f5576c;
}

.date-info {
  font-size: 1.2rem;
  color: #666;
  margin-top: 1.5rem;
}

.countdown {
  margin-top: 1rem;
  font-size: 1rem;
  color: #888;
}
</style>
