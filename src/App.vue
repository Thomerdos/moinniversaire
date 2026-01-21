<template>
  <div class="app-container">
    <Navigation />
    <!-- Indicateur de mode test -->
    <div v-if="testModeStore.isEnabled" class="test-mode-indicator">
      🧪 Mode test actif (Echap pour quitter)
    </div>
    <div class="content-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Navigation from './components/Navigation.vue'
import { useTestModeShortcuts } from './composables/useTestModeShortcuts'
import { useTestModeStore } from './stores/testMode'

// Initialise les raccourcis clavier globaux
useTestModeShortcuts()

// Store pour afficher l'indicateur
const testModeStore = useTestModeStore()
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 80px;
  padding-bottom: 20px;
}

.test-mode-indicator {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}
</style>
