<template>
  <div class="page-background" :class="is18 ? 'bg-18' : 'bg-not-18'">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AnniversaryDisplay from '../components/AnniversaryDisplay.vue'
import { useCurrentDate } from '../composables/useCurrentDate'
import { COUPLE_START_DATE, ANNIVERSARY_MONTH } from '../constants'

const { now, day, month, year, monthName, isTestMode } = useCurrentDate()

const is18 = computed(() => day.value === 18)

const emoji = computed(() => is18.value ? '🎊' : '🗓️')

const response = computed(() => is18.value ? 'OUI ! 🎉' : 'Non 😔')

const dateInfo = computed(() => {
  const prefix = isTestMode.value ? 'Mode test : ' : 'Nous sommes le '
  return `${prefix}${day.value} ${monthName.value} ${year.value}`
})

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
</script>

<style scoped>
.page-background {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.bg-18 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-not-18 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
</style>
