import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTestModeStore = defineStore('testMode', () => {
  // État du mode test
  const isEnabled = ref(false)
  
  // Date simulée (null = date réelle)
  const simulatedDate = ref(null)

  // Date effective (simulée ou réelle)
  const currentDate = computed(() => {
    if (isEnabled.value && simulatedDate.value) {
      return new Date(simulatedDate.value)
    }
    return new Date()
  })

  // Active/désactive le mode test
  const toggle = () => {
    isEnabled.value = !isEnabled.value
    if (!isEnabled.value) {
      simulatedDate.value = null
    }
  }

  // Définit une date simulée spécifique
  const setSimulatedDate = (date) => {
    simulatedDate.value = date
    isEnabled.value = true
  }

  // Simule le 18 du mois (pour IsItThe18th)
  const simulate18th = () => {
    const now = new Date()
    setSimulatedDate(new Date(now.getFullYear(), now.getMonth(), 18))
  }

  // Simule le Boulettes Jour (3 janvier)
  const simulateBoulettesJour = () => {
    const now = new Date()
    setSimulatedDate(new Date(now.getFullYear(), 0, 3))
  }

  // Réinitialise à la date réelle
  const reset = () => {
    isEnabled.value = false
    simulatedDate.value = null
  }

  return {
    isEnabled,
    simulatedDate,
    currentDate,
    toggle,
    setSimulatedDate,
    simulate18th,
    simulateBoulettesJour,
    reset
  }
})
