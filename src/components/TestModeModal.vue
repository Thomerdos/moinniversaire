<template>
  <Transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="text-2xl font-bold text-gray-800">🧪 Mode Test</h2>
          <button @click="close" class="close-button">✕</button>
        </div>
        
        <div class="modal-body">
          <p class="text-gray-600 mb-4">
            Utilisez ce mode pour tester l'application avec différentes dates.
          </p>
          
          <div class="form-group">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Date simulée :
            </label>
            <input 
              type="date" 
              v-model="selectedDate"
              class="date-input"
            />
          </div>
          
          <div class="form-group mt-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Heure simulée :
            </label>
            <input 
              type="time" 
              v-model="selectedTime"
              class="date-input"
            />
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              @click="applyTestDate" 
              class="btn-primary"
            >
              Appliquer
            </button>
            <button 
              @click="resetToRealDate" 
              class="btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
          
          <div v-if="isTestMode" class="test-mode-indicator">
            🧪 Mode test activé
          </div>
        </div>
        
        <div class="modal-footer">
          <p class="text-xs text-gray-500">
            Raccourci: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> (ou <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> sur Mac)
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'apply-test-date', 'reset-date'])

const selectedDate = ref('')
const selectedTime = ref('')

const isTestMode = computed(() => {
  return localStorage.getItem('testMode') === 'true'
})

// Initialize with current date when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    const testDate = localStorage.getItem('testDate')
    if (testDate) {
      const date = new Date(testDate)
      selectedDate.value = formatDateForInput(date)
      selectedTime.value = formatTimeForInput(date)
    } else {
      const now = new Date()
      selectedDate.value = formatDateForInput(now)
      selectedTime.value = formatTimeForInput(now)
    }
  }
})

const formatDateForInput = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTimeForInput = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const close = () => {
  emit('close')
}

const applyTestDate = () => {
  if (selectedDate.value && selectedTime.value) {
    const [hours, minutes] = selectedTime.value.split(':')
    const dateTime = new Date(selectedDate.value)
    dateTime.setHours(parseInt(hours), parseInt(minutes))
    
    localStorage.setItem('testMode', 'true')
    localStorage.setItem('testDate', dateTime.toISOString())
    
    emit('apply-test-date', dateTime)
    close()
  }
}

const resetToRealDate = () => {
  localStorage.removeItem('testMode')
  localStorage.removeItem('testDate')
  
  emit('reset-date')
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 20px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modal-enter 0.3s ease-out;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 2px solid #f3f4f6;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  background-color: #f9fafb;
  border-top: 1px solid #f3f4f6;
  border-radius: 0 0 20px 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 16px;
}

.date-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.btn-primary {
  flex: 1;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
}

.btn-secondary {
  flex: 1;
  padding: 12px 24px;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.test-mode-indicator {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  color: #92400e;
}

kbd {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 600;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-enter 0.3s ease-out;
}

.modal-fade-leave-active .modal-container {
  animation: modal-leave 0.3s ease-in;
}

@keyframes modal-leave {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
}
</style>
