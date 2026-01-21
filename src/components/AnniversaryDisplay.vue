<template>
  <div class="anniversary">
    <div class="hearts">{{ heartEmojis }}</div>
    <div v-html="message"></div>
    <div class="hearts">{{ heartEmojis }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  monthsTogether: {
    type: Number,
    required: true
  },
  isYearlyAnniversary: {
    type: Boolean,
    required: true
  },
  yearsTogether: {
    type: Number,
    required: true
  }
})

const heartEmojis = computed(() => 
  props.isYearlyAnniversary ? '💕 💖 💕' : '💕'
)

const message = computed(() => {
  if (props.isYearlyAnniversary) {
    if (props.yearsTogether === 0) {
      return "Aujourd'hui, c'est le début de notre histoire !"
    } else {
      return `${props.yearsTogether} an${props.yearsTogether > 1 ? 's' : ''} ensemble !<br><small style="font-size: 0.9rem;">(${props.monthsTogether} mois)</small>`
    }
  } else {
    return `${props.monthsTogether} mois ensemble !`
  }
})
</script>

<style scoped>
.anniversary {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 15px;
  font-size: 1.3rem;
  font-weight: bold;
  color: #d63031;
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.hearts {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}
</style>
