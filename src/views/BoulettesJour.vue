<template>
  <div class="relative">
    <!-- Bouton de test discret en bas à droite -->
    <button 
      @click="toggleTestMode"
      class="fixed bottom-4 right-4 z-50 px-2 py-1 rounded text-xs transition-all duration-300 opacity-30 hover:opacity-100"
      :class="testMode ? 'bg-mafia-gold/20 text-mafia-gold border border-mafia-gold' : 'bg-gray-800/20 text-gray-500 border border-gray-700'"
      title="Mode test pour voir le Boulettes Jour"
    >
      🧪
    </button>

    <div class="text-center p-12 bg-mafia-dark/95 rounded-[30px] shadow-2xl max-w-lg w-[90%] animate-fade-in border-4 border-mafia-gold">
      <div class="text-[6rem] mb-6 animate-bounce-slow">{{ emoji }}</div>
      <h1 
        class="text-4xl mb-4 text-mafia-gold font-bold select-none" 
        style="font-family: 'Times New Roman', serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"
      >
        Est-ce le Boulettes Jour ?
      </h1>
      <div class="text-5xl font-bold my-6" :class="isBoulettesJour ? 'text-mafia-red' : 'text-gray-400'">
        {{ response }}
      </div>
      <div class="text-xl text-mafia-gold mt-6">{{ dateInfo }}</div>
      <div v-if="countdown" class="mt-4 text-base text-gray-300">{{ countdown }}</div>
      
      <!-- Affichage du GIF et du message quand c'est le Boulettes Jour -->
      <div v-if="isBoulettesJour" class="mt-8 p-6 bg-mafia-black/50 rounded-2xl border-2 border-mafia-red">
        <!-- GIF de Tony Soprano -->
        <div class="mb-6">
          <img 
            src="https://media.giphy.com/media/3o6Zt6fzS6qEbLhKWQ/giphy.gif" 
            alt="Tony Soprano eating"
            class="w-full max-w-xs mx-auto rounded-lg"
            style="max-height: 250px; object-fit: cover;"
          />
        </div>
        <div class="text-3xl mb-4">🍝🍝🍝</div>
        <p class="text-2xl text-mafia-gold font-bold italic" style="font-family: 'Times New Roman', serif;">
          "Un giorno che rispettiamo"
        </p>
        <p class="text-lg text-gray-300 mt-2">Une tradition à honorer</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CHECK_INTERVAL_MS } from '../constants'

const now = ref(new Date())
const interval = ref(null)
const testMode = ref(false)

const day = computed(() => now.value.getDate())
const month = computed(() => now.value.getMonth())
const year = computed(() => now.value.getFullYear())

// Le Boulettes Jour est le 3 janvier (mois 0 = janvier)
// En mode test, on force la date à être le 3 janvier
const isBoulettesJour = computed(() => {
  if (testMode.value) {
    return true
  }
  return day.value === 3 && month.value === 0
})

const monthName = computed(() => 
  now.value.toLocaleDateString('fr-FR', { month: 'long' })
)

const emoji = computed(() => isBoulettesJour.value ? '🍝' : '📅')

const response = computed(() => isBoulettesJour.value ? 'OUI ! 🎊' : 'Non 😔')

const dateInfo = computed(() => {
  if (testMode.value) {
    return `Mode test : 3 janvier ${year.value}`
  }
  return `Nous sommes le ${day.value} ${monthName.value} ${year.value}`
})

const daysUntilNext3January = computed(() => {
  const currentYear = year.value
  const currentMonth = month.value
  const currentDay = day.value
  
  // Si on est le 3 janvier, retourner 0
  if (currentMonth === 0 && currentDay === 3) {
    return 0
  }
  
  // Si on est avant le 3 janvier de cette année
  if (currentMonth === 0 && currentDay < 3) {
    return 3 - currentDay
  }
  
  // Sinon, calculer jusqu'au 3 janvier de l'année prochaine
  const nextBoulettesJour = new Date(currentYear + 1, 0, 3)
  const diff = nextBoulettesJour - now.value
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const countdown = computed(() => {
  if (isBoulettesJour.value) return ''
  const days = daysUntilNext3January.value
  return `Plus que ${days} jour${days > 1 ? 's' : ''} avant le prochain Boulettes Jour !`
})

const toggleTestMode = () => {
  testMode.value = !testMode.value
  updateBodyClass()
}

const updateBodyClass = () => {
  document.body.className = isBoulettesJour.value ? 'boulettes-jour' : 'not-boulettes-jour'
}

const updateDate = () => {
  now.value = new Date()
  updateBodyClass()
}

onMounted(() => {
  updateBodyClass()
  interval.value = setInterval(updateDate, CHECK_INTERVAL_MS)
})

onUnmounted(() => {
  if (interval.value) {
    clearInterval(interval.value)
  }
})
</script>
