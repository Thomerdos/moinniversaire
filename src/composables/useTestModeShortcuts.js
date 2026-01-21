import { useMagicKeys, whenever } from '@vueuse/core'
import { useTestModeStore } from '../stores/testMode'

/**
 * Composable pour gérer les raccourcis clavier du mode test
 * 
 * Raccourcis disponibles:
 * - Ctrl+Shift+T (ou Cmd+Shift+T sur Mac): Toggle mode test
 * - Ctrl+Shift+1: Simuler le 18 du mois
 * - Ctrl+Shift+2: Simuler le Boulettes Jour (3 janvier)
 * - Escape: Désactiver le mode test
 */
export function useTestModeShortcuts() {
  const testModeStore = useTestModeStore()
  const keys = useMagicKeys()

  // Ctrl+Shift+T ou Cmd+Shift+T pour toggle le mode test
  whenever(keys['ctrl+shift+t'], () => {
    testModeStore.toggle()
    showNotification(testModeStore.isEnabled ? 'Mode test activé 🧪' : 'Mode test désactivé')
  })

  whenever(keys['meta+shift+t'], () => {
    testModeStore.toggle()
    showNotification(testModeStore.isEnabled ? 'Mode test activé 🧪' : 'Mode test désactivé')
  })

  // Ctrl+Shift+1 pour simuler le 18 du mois
  whenever(keys['ctrl+shift+1'], () => {
    testModeStore.simulate18th()
    showNotification('Simulation: 18 du mois 📅')
  })

  whenever(keys['meta+shift+1'], () => {
    testModeStore.simulate18th()
    showNotification('Simulation: 18 du mois 📅')
  })

  // Ctrl+Shift+2 pour simuler le Boulettes Jour
  whenever(keys['ctrl+shift+2'], () => {
    testModeStore.simulateBoulettesJour()
    showNotification('Simulation: Boulettes Jour 🍝')
  })

  whenever(keys['meta+shift+2'], () => {
    testModeStore.simulateBoulettesJour()
    showNotification('Simulation: Boulettes Jour 🍝')
  })

  // Escape pour désactiver le mode test
  whenever(keys['escape'], () => {
    if (testModeStore.isEnabled) {
      testModeStore.reset()
      showNotification('Mode test désactivé')
    }
  })

  return {
    isEnabled: testModeStore.isEnabled
  }
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message) {
  // Supprimer les notifications existantes
  const existing = document.querySelector('.test-mode-notification')
  if (existing) {
    existing.remove()
  }

  // Créer la notification
  const notification = document.createElement('div')
  notification.className = 'test-mode-notification'
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    animation: fadeInOut 2s ease-in-out forwards;
  `

  // Ajouter l'animation CSS si elle n'existe pas
  if (!document.querySelector('#test-mode-animation')) {
    const style = document.createElement('style')
    style.id = 'test-mode-animation'
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
        15% { opacity: 1; transform: translateX(-50%) translateY(0); }
        85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  // Supprimer après l'animation
  setTimeout(() => {
    notification.remove()
  }, 2000)
}
