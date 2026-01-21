import { ref, computed, watch } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import { useTestModeStore } from '../stores/testMode'
import { CHECK_INTERVAL_MS } from '../constants'

/**
 * Composable pour gérer la date avec support du mode test
 * Utilise VueUse useIntervalFn pour les mises à jour automatiques
 */
export function useCurrentDate() {
  const testModeStore = useTestModeStore()
  
  // Compteur pour forcer la réactivité lors des mises à jour périodiques
  const updateTrigger = ref(0)

  // Date actuelle (réactive, prend en compte le mode test)
  const now = computed(() => {
    // Accéder à updateTrigger pour créer une dépendance réactive
    // Cela force le recalcul quand updateTrigger change
    const _ = updateTrigger.value
    return testModeStore.currentDate
  })

  // Propriétés de date communes
  const day = computed(() => now.value.getDate())
  const month = computed(() => now.value.getMonth())
  const year = computed(() => now.value.getFullYear())

  // Nom du mois en français
  const monthName = computed(() => 
    now.value.toLocaleDateString('fr-FR', { month: 'long' })
  )

  // Mise à jour automatique toutes les heures
  const { pause, resume } = useIntervalFn(() => {
    if (!testModeStore.isEnabled) {
      updateTrigger.value++
    }
  }, CHECK_INTERVAL_MS)

  // Pause les mises à jour en mode test
  watch(() => testModeStore.isEnabled, (enabled) => {
    if (enabled) {
      pause()
    } else {
      resume()
      // Force une mise à jour immédiate
      updateTrigger.value++
    }
  })

  return {
    now,
    day,
    month,
    year,
    monthName,
    isTestMode: computed(() => testModeStore.isEnabled)
  }
}
