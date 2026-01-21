<template>
  <div class="relative">
    <div class="text-center p-12 bg-mafia-dark/95 rounded-[30px] shadow-2xl max-w-lg w-[90%] animate-fade-in border-4 border-mafia-gold">
      <div class="text-[6rem] mb-6 animate-bounce-slow">{{ emoji }}</div>
      <h1 class="mafia-title text-4xl mb-4 text-mafia-gold font-bold select-none">
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
            class="soprano-gif w-full max-w-xs mx-auto rounded-lg"
          />
        </div>
        <div class="text-3xl mb-4">🍝🍝🍝</div>
        <p class="mafia-quote text-2xl text-mafia-gold font-bold italic">
          "Un giorno che rispettiamo"
        </p>
        <p class="text-lg text-gray-300 mt-2">Une tradition à honorer</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useCurrentDate } from '../composables/useCurrentDate'

const { now, day, month, year, monthName, isTestMode } = useCurrentDate()

// Le Boulettes Jour est le 3 janvier (mois 0 = janvier)
const isBoulettesJour = computed(() => day.value === 3 && month.value === 0)

const emoji = computed(() => isBoulettesJour.value ? '🍝' : '📅')

const response = computed(() => isBoulettesJour.value ? 'OUI ! 🎊' : 'Non 😔')

const dateInfo = computed(() => {
  const prefix = isTestMode.value ? 'Mode test : ' : 'Nous sommes le '
  return `${prefix}${day.value} ${monthName.value} ${year.value}`
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

const updateBodyClass = () => {
  document.body.className = isBoulettesJour.value ? 'boulettes-jour' : 'not-boulettes-jour'
}

// Mettre à jour la classe du body quand la date change
watch([isBoulettesJour], updateBodyClass)

onMounted(() => {
  updateBodyClass()
})
</script>

<style scoped>
.mafia-title,
.mafia-quote {
  font-family: 'Times New Roman', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.soprano-gif {
  max-height: 250px;
  object-fit: cover;
}
</style>
