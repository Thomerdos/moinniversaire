<template>
  <nav class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg z-50">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex justify-center gap-4 flex-wrap">
        <router-link 
          to="/" 
          class="px-6 py-2 rounded-full transition-all duration-300 font-semibold"
          :class="route.path === '/' ? 'bg-purple-gradient-start text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          📆 Le 18 ?
        </router-link>
        <router-link 
          to="/temps-ensemble" 
          class="px-6 py-2 rounded-full transition-all duration-300 font-semibold"
          :class="route.path === '/temps-ensemble' ? 'bg-pink-gradient-start text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          💑 Temps ensemble
        </router-link>
        <router-link 
          to="/boulettes-jour" 
          class="px-6 py-2 rounded-full transition-all duration-300 font-semibold"
          :class="route.path === '/boulettes-jour' ? 'bg-mafia-dark text-mafia-gold shadow-lg border-2 border-mafia-gold' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          🍝 Boulettes Jour
        </router-link>
        <router-link 
          to="/galerie" 
          class="px-6 py-2 rounded-full transition-all duration-300 font-semibold"
          :class="route.path === '/galerie' ? 'bg-gradient-to-r from-purple-gradient-start to-pink-gradient-end text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        >
          📷 Galerie
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
