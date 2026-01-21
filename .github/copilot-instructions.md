# GitHub Copilot Instructions for moinniversaire

## Repository Overview

This is a modern, single-page web application called "moinniversaire" (French for "my anniversary"). The repository contains a Vue.js application that checks if the current day is the 18th of the month and displays a special anniversary message for a couple whose relationship started on July 18, 2025.

**Repository Type**: Modern Vue.js web application  
**Size**: Small  
**Languages**: JavaScript, Vue.js, CSS  
**Build Tool**: Vite  
**CSS Framework**: UnoCSS (atomic CSS engine, modern alternative to Tailwind)  
**Target Runtime**: Web browser  
**Deployment**: Static hosting (GitHub Pages, Netlify, Vercel compatible)

## Project Structure

```
moinniversaire/
├── src/
│   ├── components/
│   │   ├── AnniversaryDisplay.vue  # Anniversary message component
│   │   └── Navigation.vue          # Navigation menu component
│   ├── composables/
│   │   ├── useCurrentDate.js       # Date management with test mode support
│   │   └── useTestModeShortcuts.js # Keyboard shortcuts for test mode
│   ├── stores/
│   │   └── testMode.js             # Pinia store for test mode state
│   ├── router/
│   │   └── index.js                # Vue Router configuration
│   ├── views/
│   │   ├── IsItThe18th.vue         # Main "Is it the 18th?" view
│   │   ├── TimeTogether.vue        # Time together calculator view
│   │   └── BoulettesJour.vue       # Boulettes day checker view
│   ├── App.vue                     # Root application component
│   ├── main.js                     # Application entry point
│   ├── constants.js                # Application constants
│   └── style.css                   # Global styles
├── public/
│   ├── sopranos-pasta.gif          # Static assets (GIFs, images)
│   └── .nojekyll                   # GitHub Pages config
├── index.html                      # HTML template
├── uno.config.js                   # UnoCSS configuration
├── vite.config.js                  # Vite configuration
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Locked dependency versions
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
└── .github/
    └── copilot-instructions.md     # This file
```

## Key Features

- **Multi-Page Application**: Three main views with Vue Router navigation
  - Is it the 18th?: Check if today is the 18th of the month
  - Time Together: Anniversary tracker since July 18, 2025
  - Boulettes Jour: Special day checker (January 3rd)
- **Test Mode**: Keyboard shortcuts (Alt+1, Alt+2, Alt+T) to simulate different dates
- **Responsive Design**: Mobile-friendly modern interface with breakpoints
- **Real-time Updates**: Automatic date checks every hour with VueUse
- **State Management**: Pinia store for test mode coordination
- **Theme Customization**: Multiple color themes (purple, pink, peach, mafia)
- **UnoCSS Styling**: Instant atomic CSS with custom utilities
- **Vue 3 Composition API**: Modern reactive state management

## Technology Stack

- **Vue 3**: Progressive JavaScript framework with Composition API
- **Vue Router**: Official routing library for Vue.js
- **Pinia**: Official state management library for Vue (Vuex successor)
- **VueUse**: Collection of essential Vue Composition Utilities
- **Vite**: Ultra-fast build tool and dev server (HMR support)
- **UnoCSS**: Instant atomic CSS engine (alternative to Tailwind CSS)
- **ES Modules**: Modern JavaScript module system

## Vue.js Best Practices

### Composition API (`<script setup>`)

**ALWAYS use `<script setup>` syntax** - it's more concise and performant:

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// Direct top-level declarations become exposed to template
const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

### Reactivity Best Practices

1. **Use `ref()` for primitive values:**
   ```javascript
   const count = ref(0)
   const name = ref('John')
   // Access with .value in script
   count.value++
   ```

2. **Use `reactive()` for objects (sparingly):**
   ```javascript
   const state = reactive({
     count: 0,
     user: { name: 'John' }
   })
   // No .value needed
   state.count++
   ```

3. **Prefer `ref()` over `reactive()`** - better type inference and clearer reactivity tracking

4. **Use `computed()` for derived state:**
   ```javascript
   const doubled = computed(() => count.value * 2)
   // Never modify computed values, they're read-only
   ```

5. **Use `watch()` for side effects:**
   ```javascript
   watch(count, (newValue, oldValue) => {
     console.log(`Count changed from ${oldValue} to ${newValue}`)
   })
   ```

### Component Props

Use `defineProps()` with clear types:

```javascript
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  isActive: Boolean
})
```

### Component Emits

Use `defineEmits()` for type-safe events:

```javascript
const emit = defineEmits(['update', 'delete'])

function handleClick() {
  emit('update', { id: 1, name: 'Updated' })
}
```

## Pinia Best Practices

### Store Structure

Create stores in `src/stores/` directory:

```javascript
// src/stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State as refs
  const count = ref(0)
  
  // Getters as computed
  const doubleCount = computed(() => count.value * 2)
  
  // Actions as functions
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

### Using Stores in Components

```javascript
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()

// Access state
console.log(counterStore.count)

// Call actions
counterStore.increment()
```

**Key Pinia Principles:**
- Use composition style (not options API style)
- Keep stores focused on specific domains
- Actions should contain business logic
- State should be minimal and normalized

## VueUse Best Practices

VueUse provides essential composition utilities. Use them instead of reinventing the wheel.

### Common VueUse Composables

1. **`useIntervalFn`** - Interval with auto-cleanup:
   ```javascript
   import { useIntervalFn } from '@vueuse/core'
   
   const { pause, resume } = useIntervalFn(() => {
     console.log('Tick')
   }, 1000) // 1 second
   ```

2. **`useMagicKeys`** - Keyboard shortcuts:
   ```javascript
   import { useMagicKeys, whenever } from '@vueuse/core'
   
   const keys = useMagicKeys()
   
   whenever(keys['ctrl+s'], () => {
     console.log('Save shortcut pressed')
   })
   ```

3. **`useLocalStorage`** - Reactive localStorage:
   ```javascript
   import { useLocalStorage } from '@vueuse/core'
   
   const state = useLocalStorage('my-key', { count: 0 })
   state.value.count++ // Auto-saved to localStorage
   ```

4. **`useMediaQuery`** - Responsive breakpoints:
   ```javascript
   import { useMediaQuery } from '@vueuse/core'
   
   const isMobile = useMediaQuery('(max-width: 768px)')
   ```

5. **`useTitle`** - Document title:
   ```javascript
   import { useTitle } from '@vueuse/core'
   
   const title = useTitle('My App')
   title.value = 'New Title' // Updates document.title
   ```

**When to use VueUse:**
- Browser APIs (localStorage, mediaQuery, etc.)
- Event listeners (resize, scroll, keyboard)
- Timers and intervals
- Animations and transitions

## UnoCSS Best Practices

### Utility-First Approach

**ALWAYS prefer utility classes over custom CSS:**

```vue
<!-- ✅ Good: Use utility classes -->
<div class="flex items-center justify-between p-4 bg-blue-500 rounded-lg">

<!-- ❌ Bad: Custom CSS -->
<div class="my-custom-container">
<style>
.my-custom-container {
  display: flex;
  padding: 1rem;
  background: blue;
}
</style>
```

### UnoCSS Syntax

1. **Arbitrary values with brackets:**
   ```html
   <div class="text-[14px] w-[300px] p-[1.5rem]">
   ```

2. **Responsive design:**
   ```html
   <div class="text-sm md:text-lg lg:text-xl">
   ```

3. **Pseudo-classes:**
   ```html
   <button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700">
   ```

4. **Dynamic classes:**
   ```vue
   <div :class="isActive ? 'bg-green-500' : 'bg-gray-500'">
   ```

5. **Opacity modifiers:**
   ```html
   <div class="bg-black/50 text-white/90">
   ```

### Custom UnoCSS Configuration

Define reusable shortcuts in `uno.config.js`:

```javascript
shortcuts: {
  'btn-primary': 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
  'card': 'p-6 bg-white rounded-lg shadow-lg'
}
```

Use custom theme colors:

```javascript
theme: {
  colors: {
    'brand-primary': '#667eea',
    'brand-secondary': '#764ba2'
  }
}
```

### UnoCSS vs Custom CSS

**When to use UnoCSS utilities:**
- Layout (flex, grid, spacing)
- Colors and backgrounds
- Typography
- Borders and shadows
- Responsive design
- Hover/active states

**When to use custom CSS:**
- Complex animations with keyframes
- Very specific styles not covered by utilities
- Legacy browser support needs

## Vue Router Best Practices

### Route Definition

Define routes clearly in `src/router/index.js`:

```javascript
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

### Navigation

Use `<router-link>` for navigation:

```vue
<router-link to="/">Home</router-link>
<router-link :to="{ name: 'about' }">About</router-link>
```

Programmatic navigation:

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

function navigate() {
  router.push('/about')
  // or
  router.push({ name: 'about' })
}
```

## Performance Best Practices

1. **Lazy load routes:**
   ```javascript
   component: () => import('../views/HeavyView.vue')
   ```

2. **Use `v-once` for static content:**
   ```vue
   <div v-once>{{ staticContent }}</div>
   ```

3. **Use `v-memo` for expensive lists:**
   ```vue
   <div v-for="item in list" :key="item.id" v-memo="[item.id]">
   ```

4. **Debounce expensive operations:**
   ```javascript
   import { useDebounceFn } from '@vueuse/core'
   
   const debouncedSearch = useDebounceFn((query) => {
     // Expensive search operation
   }, 300)
   ```

5. **Minimize reactive state** - only make reactive what needs to be reactive

## Code Organization Best Practices

### Composables (Custom Hooks)

Create reusable logic in `src/composables/`:

```javascript
// src/composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count,
    increment,
    decrement
  }
}
```

Use in components:

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment, decrement } = useCounter(10)
</script>
```

### File Naming Conventions

- **Components**: PascalCase - `MyComponent.vue`
- **Views**: PascalCase - `HomeView.vue`
- **Composables**: camelCase with `use` prefix - `useCurrentDate.js`
- **Stores**: camelCase - `userStore.js`
- **Utils**: camelCase - `formatDate.js`

### Import Aliases

Use `@` alias for cleaner imports (configured in Vite):

```javascript
import MyComponent from '@/components/MyComponent.vue'
import { useUserStore } from '@/stores/user'
```

## Testing Best Practices

### Test Mode Implementation

This project uses a test mode for date simulation:

```javascript
// Test mode store
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTestModeStore = defineStore('testMode', () => {
  const isEnabled = ref(false)
  const testDate = ref(new Date())
  
  const currentDate = computed(() => 
    isEnabled.value ? testDate.value : new Date()
  )
  
  function simulateDate(date) {
    isEnabled.value = true
    testDate.value = date
  }
  
  return { isEnabled, currentDate, simulateDate }
})
```

Use keyboard shortcuts (Alt+1, Alt+2) to trigger test modes without modifying code.

## Common Anti-Patterns to Avoid

1. **❌ Mutating props:**
   ```javascript
   // DON'T
   props.count++ // Props are read-only!
   
   // DO
   const localCount = ref(props.count)
   localCount.value++
   ```

2. **❌ Direct DOM manipulation:**
   ```javascript
   // DON'T
   document.getElementById('my-element').textContent = 'New text'
   
   // DO
   const text = ref('New text')
   // Then use {{ text }} in template
   ```

3. **❌ Using reactive() for everything:**
   ```javascript
   // DON'T
   const state = reactive({
     count: 0,
     name: 'John'
   })
   
   // DO - Better type inference and destructuring
   const count = ref(0)
   const name = ref('John')
   ```

4. **❌ Not cleaning up side effects:**
   ```javascript
   // DON'T
   onMounted(() => {
     setInterval(() => {}, 1000) // Memory leak!
   })
   
   // DO
   let intervalId
   onMounted(() => {
     intervalId = setInterval(() => {}, 1000)
   })
   onUnmounted(() => {
     clearInterval(intervalId)
   })
   
   // BETTER - Use VueUse
   import { useIntervalFn } from '@vueuse/core'
   const { pause } = useIntervalFn(() => {}, 1000)
   // Auto-cleanup on unmount
   ```

5. **❌ Overusing watchers:**
   ```javascript
   // DON'T
   watch(firstName, () => {
     fullName.value = `${firstName.value} ${lastName.value}`
   })
   
   // DO - Use computed instead
   const fullName = computed(() => 
     `${firstName.value} ${lastName.value}`
   )
   ```

## Development Guidelines

### Setup and Installation

**First time setup:**
```bash
# Install dependencies (ALWAYS do this first)
npm install
```

**Development server:**
```bash
# Start dev server with hot module replacement
npm run dev
# Server runs on http://localhost:5173
```

**Production build:**
```bash
# Create optimized production build
npm run build
# Output goes to dist/ directory

# Preview production build locally
npm run preview
```

### Important Constants

When modifying the application logic, be aware of these key constants in `src/constants.js`:

- `CHECK_INTERVAL_MS`: Interval for date updates (default: 3600000 = 1 hour)
- `COUPLE_START_DATE`: Relationship start date (July 18, 2025)
- `ANNIVERSARY_DAY`: Day of month for anniversary (18)
- `BOULETTES_DAY`: Day for Boulettes Jour (3)
- `BOULETTES_MONTH`: Month for Boulettes Jour (0 = January)

**Note**: JavaScript months are 0-indexed (January = 0, February = 1, etc.)

### Code Architecture

**Application Structure:**

This is a multi-page application with:
- **Router**: Vue Router with hash-based navigation
- **State**: Pinia store for global test mode state
- **Composables**: Reusable logic (date handling, keyboard shortcuts)
- **Views**: Page-level components (IsItThe18th, TimeTogether, BoulettesJour)
- **Components**: Reusable UI components (Navigation, AnniversaryDisplay)

**Component Hierarchy:**

```
App.vue (root)
├── Navigation.vue (persistent across routes)
└── <router-view> (dynamic based on route)
    ├── IsItThe18th.vue
    ├── TimeTogether.vue
    └── BoulettesJour.vue
        └── Uses date logic from useCurrentDate composable
```

**State Management (Pinia):**

- `testModeStore`: Controls test mode state and simulated dates
  - `isEnabled`: Boolean for test mode status
  - `currentDate`: Computed date (real or simulated)
  - Methods: `toggle()`, `simulate18th()`, `simulateBoulettesJour()`, `reset()`

**Composables (Reusable Logic):**

1. **`useCurrentDate()`**: Date management with test mode support
   - Returns: `now`, `day`, `month`, `year`, `monthName`, `isTestMode`
   - Uses VueUse's `useIntervalFn` for automatic updates
   - Integrates with test mode store

2. **`useTestModeShortcuts()`**: Keyboard shortcut management
   - Uses VueUse's `useMagicKeys` and `whenever`
   - Alt+T: Toggle test mode
   - Alt+1: Simulate 18th
   - Alt+2: Simulate Boulettes Jour
   - Escape: Exit test mode

**View Components:**

- **`IsItThe18th.vue`**: Main "Is it the 18th?" checker
  - Displays current date and countdown
  - Shows anniversary info when it's the 18th
  - Uses purple/pink gradient theme

- **`TimeTogether.vue`**: Time together calculator
  - Calculates months/years since July 18, 2025
  - Displays relationship milestones
  - Uses peach gradient theme

- **`BoulettesJour.vue`**: Boulettes day checker (January 3rd)
  - Special mafia-themed design
  - Side-by-side layout on desktop, stacked on mobile
  - Displays Sopranos GIF when it's Boulettes Jour
  - Uses dark mafia theme (black, gold, red)

### Styling with UnoCSS

**UnoCSS Configuration (`uno.config.js`):**

- Custom color palette:
  - **Anniversary theme**: `purple-gradient-start/end`, `pink-gradient-start/end`, `peach-gradient-start/end`
  - **Mafia theme**: `mafia-dark` (#1a1a1a), `mafia-red` (#8B0000), `mafia-gold` (#D4AF37), `mafia-black`, `mafia-blood`

- Custom animation shortcuts:
  - `animate-fade-in`: 0.6s fade in effect
  - `animate-bounce-slow`: 1s infinite bounce
  - `animate-pulse-slow`: 2s infinite pulse

**Using UnoCSS in components:**

- Utility classes: `class="text-center p-12 bg-white/95"`
- Responsive: `max-w-lg w-[90%] md:w-[80%] lg:w-[70%]"`
- Arbitrary values: `text-[6rem]`, `rounded-[30px]`, `p-[1.5rem]`
- Dynamic classes: `:class="is18 ? 'text-purple-gradient-start' : 'text-pink-gradient-end'"`
- Opacity modifiers: `bg-mafia-dark/95`, `bg-black/50`

**Theme-specific patterns:**

1. **Anniversary theme** (IsItThe18th, TimeTogether):
   ```html
   <div class="bg-gradient-to-br from-purple-gradient-start to-purple-gradient-end">
   ```

2. **Mafia theme** (BoulettesJour):
   ```html
   <div class="bg-mafia-dark/95 border-4 border-mafia-gold text-mafia-gold">
   ```

3. **Responsive layouts**:
   ```html
   <!-- Desktop: side-by-side, Mobile: stacked -->
   <div class="flex flex-col lg:flex-row gap-4">
   ```

### Code Style

- **Vue Components**: 
  - Use `<script setup>` syntax for Composition API
  - Single File Components (.vue files)
  - Props defined with `defineProps()`
  - Computed properties for derived state

- **JavaScript**:
  - ES6+ syntax (arrow functions, destructuring, const/let)
  - Composition API patterns
  - French date formatting with `toLocaleDateString('fr-FR')`
  - Clear, descriptive variable and function names

- **CSS/Styling**:
  - UnoCSS utility classes in templates
  - Global styles in `src/style.css`
  - Body classes dynamically set: `.is-18` / `.not-18`

### Testing and Validation

**Development testing:**

1. Run `npm install` (if dependencies not installed)
2. Run `npm run dev`
3. Open browser to `http://localhost:5173/moinniversaire/`
4. Use test mode shortcuts:
   - **Alt+T**: Toggle test mode on/off
   - **Alt+1**: Simulate 18th of the month
   - **Alt+2**: Simulate Boulettes Jour (January 3rd)
   - **Escape**: Exit test mode
5. Test different viewports for responsiveness
6. Check browser console for errors
7. Verify animations and transitions work
8. Navigate between all pages

**Production testing:**

1. Run `npm run build`
2. Run `npm run preview`
3. Test the production build at `http://localhost:4173/moinniversaire/`
4. Verify all features work correctly
5. Check that assets load properly
6. Test on multiple browsers (Chrome, Firefox, Safari)

**Responsive testing breakpoints:**

- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Test mode usage:**

The test mode allows you to simulate different dates without changing code:

```javascript
// Activating test mode programmatically (for debugging)
import { useTestModeStore } from '@/stores/testMode'

const testModeStore = useTestModeStore()
testModeStore.simulateDate(new Date(2026, 0, 18)) // Simulate Jan 18, 2026
```

**Common test scenarios:**

1. Test 18th of any month (Alt+1)
2. Test Boulettes Jour (Alt+2)
3. Test normal days (Escape to exit test mode)
4. Test year transitions (New Year's Eve, New Year's Day)
5. Test leap years if applicable

### Common Tasks

**Add a new page/view:**
1. Create view component in `src/views/`
2. Add route to `src/router/index.js`
3. Add navigation link to `src/components/Navigation.vue`

**Add a new computed property:**
```javascript
const myComputed = computed(() => {
  // Your logic here
  return someValue
})
```

**Create a new composable:**
```javascript
// src/composables/useMyLogic.js
import { ref, computed } from 'vue'

export function useMyLogic() {
  const state = ref(0)
  
  const doubled = computed(() => state.value * 2)
  
  function increment() {
    state.value++
  }
  
  return { state, doubled, increment }
}
```

**Add a new Pinia store:**
```javascript
// src/stores/myStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubled, increment }
})
```

**Modify date check interval:**
```javascript
// In src/constants.js
export const CHECK_INTERVAL_MS = 1800000 // Change to 30 minutes
```

**Add new UnoCSS theme colors:**
```javascript
// In uno.config.js
theme: {
  colors: {
    'my-brand': '#FF5733',
    'my-accent': '#C70039'
  }
}
```

**Add new UnoCSS shortcuts:**
```javascript
// In uno.config.js
shortcuts: {
  'btn-primary': 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
  'card-elevated': 'p-6 bg-white rounded-2xl shadow-2xl'
}
```

**Add keyboard shortcut:**
```javascript
// In src/composables/useTestModeShortcuts.js
import { useMagicKeys, whenever } from '@vueuse/core'

const keys = useMagicKeys()

whenever(keys['alt+3'], () => {
  // Your action here
  showNotification('My shortcut triggered! ⚡')
})
```

### Best Practices for This Repository

1. **Always run `npm install` before starting development**
2. **Use `npm run dev` for development** - enables hot module replacement (HMR)
3. **French language**: Keep all user-facing text in French
4. **Component composition**: Keep components small, focused, and reusable
5. **Composition API**: Always use `<script setup>` syntax with Vue 3 Composition API
6. **Reactive patterns**: Use Vue's reactive system via `ref()` and `computed()`, never manipulate DOM directly
7. **VueUse first**: Check VueUse library before implementing custom logic (intervals, keyboard, storage, etc.)
8. **UnoCSS utilities**: Prefer utility classes over custom CSS for consistency and performance
9. **Pinia stores**: Use for global state only; keep component state local with `ref()`
10. **Composables**: Extract reusable logic into composables (`use*` pattern)
11. **Type safety**: Use clear prop types and consider TypeScript for larger features
12. **Test in browser**: Always verify changes with test mode shortcuts (Alt+1, Alt+2, Alt+T)
13. **Responsive design**: Test on multiple screen sizes (mobile, tablet, desktop)
14. **Performance**: Lazy-load routes and use `v-once` for static content
15. **Clean code**: Follow Vue style guide and keep files under 300 lines when possible

### File-Specific Guidelines

**`src/App.vue`:**
- Root component with router setup
- Navigation component (persistent across routes)
- Test mode indicator display
- Global layout and padding configuration

**`src/main.js`:**
- Application entry point
- Pinia and Vue Router initialization
- UnoCSS import (virtual module)
- Global styles import

**`src/router/index.js`:**
- Route definitions with hash history
- Lazy-loaded view components
- Route names for programmatic navigation

**`src/stores/testMode.js`:**
- Pinia store for test mode state
- Methods: `toggle()`, `simulate18th()`, `simulateBoulettesJour()`, `reset()`
- Computed `currentDate` property

**`src/composables/useCurrentDate.js`:**
- Date management composable
- Integrates with test mode store
- Uses VueUse's `useIntervalFn` for auto-updates
- Returns reactive date properties and `isTestMode` flag

**`src/composables/useTestModeShortcuts.js`:**
- Keyboard shortcut management
- Uses VueUse's `useMagicKeys` and `whenever`
- Creates notification system for user feedback

**`src/views/IsItThe18th.vue`:**
- Main "18th checker" view
- Anniversary display integration
- Purple/pink gradient theme

**`src/views/TimeTogether.vue`:**
- Relationship time calculator
- Milestone tracking
- Peach gradient theme

**`src/views/BoulettesJour.vue`:**
- January 3rd checker
- Responsive side-by-side layout (desktop) / stacked (mobile)
- Mafia theme with Sopranos GIF
- Conditional layout based on date

**`src/components/Navigation.vue`:**
- Top navigation bar
- Active route highlighting
- Responsive mobile menu

**`src/components/AnniversaryDisplay.vue`:**
- Pure presentational component
- Props: `monthsTogether`, `isYearlyAnniversary`, `yearsTogether`
- No internal state

**`src/constants.js`:**
- Application-wide constants
- CHECK_INTERVAL_MS, date constants
- Keep constants here instead of hardcoding

**`uno.config.js`:**
- UnoCSS configuration
- Custom theme colors (gradients, mafia theme)
- Animation shortcuts
- Keep presets: `presetUno()`, `presetAttributify()`

**`vite.config.js`:**
- Vite build configuration
- Base path: `./moinniversaire/` for GitHub Pages
- Plugin order: UnoCSS before Vue
- Keep minimal configuration

**`public/` directory:**
- Static assets (images, GIFs, fonts)
- Served at root path (access via `/filename.ext`)
- `.nojekyll` file for GitHub Pages
- Large files (like GIFs) go here

### Troubleshooting

**Issue: `npm run dev` fails**
- Solution: Run `npm install` first to ensure dependencies are installed
- Check Node.js version (should be 16+ recommended)

**Issue: Changes not reflecting in browser**
- Solution: Vite has HMR enabled, but hard refresh (Ctrl+F5) if needed
- Check browser console for errors

**Issue: UnoCSS classes not working**
- Solution: Verify class names in UnoCSS presets documentation
- Check `uno.config.js` for custom configurations
- Restart dev server after config changes

**Issue: Build fails**
- Solution: Run `npm install` to ensure all dev dependencies are present
- Check for syntax errors in .vue files
- Verify all imports are correct

**Issue: Date calculations incorrect**
- Solution: JavaScript months are 0-indexed (January = 0)
- Verify `COUPLE_START_DATE` is set correctly
- Check computed properties logic in `App.vue`

### Validation Checklist

**Before committing changes:**

1. ✅ Run `npm install` (if new dependencies added)
2. ✅ Run `npm run dev` and test in browser
3. ✅ Check console for errors or warnings
4. ✅ Test responsive design (mobile, tablet, desktop)
5. ✅ Verify all animations work smoothly
6. ✅ Test date calculations if modified
7. ✅ Run `npm run build` to ensure production build works
8. ✅ Verify French language text is correct

## Additional Notes

- **No test suite configured**: Manual testing in browser is required
- **No CI/CD pipeline**: Consider adding GitHub Actions for automated builds
- **No linting configured**: Consider adding ESLint and Prettier for code quality
- **Client-side only**: No backend or API calls
- **No state persistence**: Date calculations are real-time only

## Deployment

**Build for production:**
```bash
npm run build
```

The `dist/` directory will contain the optimized production build ready for deployment to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).
