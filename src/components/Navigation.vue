<template>
  <nav class="fixed top-0 left-0 right-0 z-50 nav-transparent">
    <!-- Desktop Navigation -->
    <div class="hidden md:block">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex justify-center gap-3">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path" 
            class="nav-link"
            :class="route.path === link.path ? 'active' : ''"
          >
            {{ link.icon }} {{ link.label }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div class="md:hidden">
      <!-- Mobile Toggle Button -->
      <button 
        @click="toggleMobileMenu"
        class="mobile-menu-btn"
        :class="{ 'menu-open': mobileMenuOpen }"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Mobile Menu Overlay -->
      <transition name="fade">
        <div 
          v-if="mobileMenuOpen" 
          class="mobile-overlay"
          @click="mobileMenuOpen = false"
        ></div>
      </transition>

      <!-- Mobile Menu Panel -->
      <transition name="slide">
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path" 
            class="mobile-nav-link"
            :class="route.path === link.path ? 'active' : ''"
            @click="mobileMenuOpen = false"
          >
            <span class="text-2xl">{{ link.icon }}</span>
            <span>{{ link.label }}</span>
          </router-link>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', icon: '📆', label: 'Le 18 ?' },
  { path: '/temps-ensemble', icon: '💑', label: 'Temps' },
  { path: '/boulettes-jour', icon: '🍝', label: 'Boulettes' },
  { path: '/galerie', icon: '📷', label: 'Galerie' }
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
/* Transparent navigation - always */
.nav-transparent {
  background: transparent;
}

/* Desktop nav links */
.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.05);
}

.nav-link.active {
  background: rgba(102, 126, 234, 0.7);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Mobile menu button */
.mobile-menu-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  z-index: 60;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover {
  background: rgba(102, 126, 234, 0.6);
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.menu-open .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-open .hamburger-line:nth-child(2) {
  opacity: 0;
}

.menu-open .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 55;
}

/* Mobile menu panel */
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 5rem 1.5rem 2rem;
  z-index: 56;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: rgba(102, 126, 234, 0.3);
  transform: translateX(5px);
}

.mobile-nav-link.active {
  border-left: 3px solid #667eea;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
