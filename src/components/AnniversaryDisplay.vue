<template>
  <div class="mt-8 p-6 rounded-2xl text-[1.3rem] font-bold text-red-600 animate-pulse-slow bg-gradient-to-br from-peach-gradient-start to-peach-gradient-end">
    <div class="text-2xl my-2">{{ heartEmojis }}</div>
    <div v-html="message"></div>
    <div class="text-2xl my-2">{{ heartEmojis }}</div>
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
