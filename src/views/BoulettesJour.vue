<template>
  <div class="page-background" :class="isBoulettesJour ? 'bg-boulettes-jour' : 'bg-not-boulettes-jour'">
    <div class="relative w-full flex justify-center items-center px-4">
    <!-- Layout normal (non-Boulettes Jour) -->
    <div v-if="!isBoulettesJour" class="text-center p-12 bg-mafia-dark/95 rounded-[30px] shadow-2xl max-w-lg w-[90%] animate-fade-in border-4 border-mafia-gold">
      <div class="text-[6rem] mb-6 animate-bounce-slow">{{ emoji }}</div>
      <h1 class="mafia-title text-4xl mb-4 text-mafia-gold font-bold select-none">
        Est-ce le Boulettes Jour ?
      </h1>
      <div class="text-5xl font-bold my-6 text-gray-400">
        {{ response }}
      </div>
      <div class="text-xl text-mafia-gold mt-6">{{ dateInfo }}</div>
      <div v-if="countdown" class="mt-4 text-base text-gray-300">{{ countdown }}</div>
    </div>

    <!-- Layout spécial quand c'est le Boulettes Jour (côte à côte sur desktop) -->
    <div v-else class="boulettes-jour-container animate-fade-in">
      <!-- Partie gauche : Message principal -->
      <div class="boulettes-jour-content text-center p-10 bg-mafia-dark/95 rounded-[30px] shadow-2xl border-4 border-mafia-gold">
        <div class="text-[6rem] mb-6 animate-bounce-slow">{{ emoji }}</div>
        <h1 class="mafia-title text-4xl mb-4 text-mafia-gold font-bold select-none">
          Est-ce le Boulettes Jour ?
        </h1>
        <div class="text-5xl font-bold my-6 text-mafia-red">
          {{ response }}
        </div>
        <div class="text-xl text-mafia-gold mt-6">{{ dateInfo }}</div>
        
        <!-- Message et emojis -->
        <div class="mt-8 p-6 bg-mafia-black/50 rounded-2xl border-2 border-mafia-red">
          <div class="text-3xl mb-4">🍝🍝🍝</div>
          <p class="mafia-quote text-2xl text-mafia-gold font-bold italic">
            "Un giorno che rispettiamo"
          </p>
          <p class="text-lg text-gray-300 mt-2">Une tradition à honorer</p>
        </div>
      </div>

      <!-- Partie droite : GIF de Tony Soprano -->
      <div class="boulettes-jour-gif">
        <div class="gif-container bg-mafia-dark/95 rounded-[30px] shadow-2xl border-4 border-mafia-gold p-4">
          <img 
            :src="sopranoGifUrl" 
            alt="Tony Soprano eating pasta"
            class="soprano-gif rounded-lg"
          />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
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

// URL du GIF avec base path dynamique
const sopranoGifUrl = computed(() => `${import.meta.env.BASE_URL}sopranos-pasta.gif`)

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

.bg-boulettes-jour {
  background: linear-gradient(135deg, #1a1a1a 0%, #8B0000 100%);
}

.bg-not-boulettes-jour {
  background: linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 100%);
}

.mafia-title,
.mafia-quote {
  font-family: 'Times New Roman', serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Layout côte à côte pour le Boulettes Jour */
.boulettes-jour-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  align-items: center;
}

/* Desktop : layout côte à côte */
@media (min-width: 1024px) {
  .boulettes-jour-container {
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
  }
  
  .boulettes-jour-content {
    flex: 1;
    max-width: 500px;
  }
  
  .boulettes-jour-gif {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }
}

/* Tablet : layout vertical */
@media (max-width: 1023px) {
  .boulettes-jour-content {
    width: 90%;
    max-width: 500px;
  }
  
  .boulettes-jour-gif {
    width: 90%;
    max-width: 400px;
  }
}

/* Container du GIF */
.gif-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.soprano-gif {
  width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  display: block;
}

/* Pour les très petits écrans */
@media (max-width: 640px) {
  .soprano-gif {
    max-height: 400px;
  }
}
</style>
