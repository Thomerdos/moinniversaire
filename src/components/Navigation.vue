<template>
  <nav 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="[
      isGalleryPage ? 'nav-minimal' : 'nav-full',
      isScrolled ? 'nav-scrolled' : ''
    ]"
  >
    <!-- Desktop Navigation -->
    <div class="hidden md:block">
      <div class="max-w-4xl mx-auto px-4 py-3">
        <div class="flex justify-center gap-3">
          <router-link 
            v-for="link in navLinks" 
            :key="link.path"
            :to="link.path" 
            class="nav-link"
            :class="getNavClass(link.path, link.activeClass)"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { path: '/', icon: '📆', label: 'Le 18 ?', activeClass: 'bg-purple-gradient-start' },
  { path: '/temps-ensemble', icon: '💑', label: 'Temps', activeClass: 'bg-pink-gradient-start' },
  { path: '/boulettes-jour', icon: '🍝', label: 'Boulettes', activeClass: 'bg-mafia-dark border-mafia-gold' },
  { path: '/galerie', icon: '📷', label: 'Galerie', activeClass: 'bg-gradient-to-r from-purple-gradient-start to-pink-gradient-end' }
]

const isGalleryPage = computed(() => route.path === '/galerie')

const getNavClass = (path, activeClass) => {
  if (route.path === path) {
    return `${activeClass} text-white shadow-lg`
  }
  return isGalleryPage.value 
    ? 'bg-white/10 text-white/80 hover:bg-white/20' 
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Base navigation styles */
.nav-full {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.nav-minimal {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.nav-scrolled {
  background: rgba(0, 0, 0, 0.6);
}

/* Desktop nav links */
.nav-link {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
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
