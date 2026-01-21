<template>
  <div class="mt-8 p-6 rounded-2xl text-[1.3rem] font-bold text-red-600 animate-pulse-slow bg-gradient-to-br from-peach-gradient-start to-peach-gradient-end">
    <div class="text-2xl my-2">{{ heartEmojis }}</div>
    <div v-if="isYearlyAnniversary && yearsTogether === 0">
      Aujourd'hui, c'est le début de notre histoire !
    </div>
    <div v-else-if="isYearlyAnniversary">
      {{ yearsTogether }} an{{ yearsTogether > 1 ? 's' : '' }} ensemble !
      <div class="text-base font-normal mt-1">({{ monthsTogether }} mois)</div>
    </div>
    <div v-else>
      {{ monthsTogether }} mois ensemble !
    </div>
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
</script>
