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
│   │   └── AnniversaryDisplay.vue  # Component for anniversary messages
│   ├── App.vue                     # Main application component
│   ├── main.js                     # Entry point
│   └── style.css                   # Global styles
├── public/                         # Static assets
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

- **Date Checker**: Real-time check if today is the 18th of the month
- **Anniversary Tracker**: Calculates months/years together since July 18, 2025
- **Countdown**: Shows days until the next 18th
- **Responsive Design**: Mobile-friendly modern interface
- **Real-time Updates**: Checks date every hour automatically
- **Vue 3 Composition API**: Modern reactive state management
- **UnoCSS**: Instant atomic CSS with utility classes

## Technology Stack

- **Vue 3**: Progressive JavaScript framework with Composition API
- **Vite**: Ultra-fast build tool and dev server (HMR support)
- **UnoCSS**: Instant atomic CSS engine (alternative to Tailwind CSS)
- **ES Modules**: Modern JavaScript module system

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

When modifying the application logic, be aware of these key constants in `src/App.vue`:

- `COUPLE_START_DATE`: Set to `new Date(2025, 6, 18)` (July 18, 2025)
- `ANNIVERSARY_MONTH`: Set to `6` (July, 0-indexed)
- `CHECK_INTERVAL_MS`: Set to `3600000` (1 hour in milliseconds)

### Code Architecture

**Component Structure:**

- **`App.vue`**: Main component containing all date logic and state management
  - Uses Vue 3 Composition API with `<script setup>` syntax
  - Reactive state with `ref()` and computed properties
  - Lifecycle hooks: `onMounted()`, `onUnmounted()`
  - Handles interval-based date updates

- **`AnniversaryDisplay.vue`**: Presentational component for anniversary messages
  - Accepts props: `monthsTogether`, `isYearlyAnniversary`, `yearsTogether`
  - Pure component with no internal state
  - Computes appropriate message based on props

**State Management:**

- `now`: Reactive reference to current date/time
- All display values are computed properties derived from `now`
- Interval updates `now` every hour to keep UI in sync

**Key Computed Properties:**

1. `is18` - Boolean, true if current day is 18th
2. `emoji` - Display emoji based on whether it's the 18th
3. `response` - "OUI ! 🎉" or "Non 😔"
4. `dateInfo` - Formatted current date string
5. `daysUntilNext18` - Days countdown calculation
6. `monthsTogether` - Total months since couple start date
7. `showAnniversary` - Boolean for showing anniversary component

### Styling with UnoCSS

**UnoCSS Configuration (`uno.config.js`):**

- Custom color palette for gradients:
  - `purple-gradient-start` / `purple-gradient-end`
  - `pink-gradient-start` / `pink-gradient-end`
  - `peach-gradient-start` / `peach-gradient-end`

- Custom animation shortcuts:
  - `animate-fade-in`: 0.6s fade in
  - `animate-bounce-slow`: 1s infinite bounce
  - `animate-pulse-slow`: 2s infinite pulse

**Using UnoCSS in components:**

- Use utility classes directly in templates: `class="text-center p-12 bg-white/95"`
- Responsive classes: `max-w-lg w-[90%]`
- Custom values with brackets: `text-[6rem]`, `rounded-[30px]`
- Gradient text: `:class="is18 ? 'text-purple-gradient-start' : 'text-pink-gradient-end'"`

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
3. Open browser to `http://localhost:5173`
4. Test different viewports for responsiveness
5. Check browser console for errors
6. Verify animations and transitions work

**Production testing:**

1. Run `npm run build`
2. Run `npm run preview`
3. Test the production build
4. Verify all features work correctly

**To test date-specific behavior:**

- Temporarily modify `now.value` in `App.vue`
- Use browser DevTools to override `Date` constructor
- Mock the `updateDate()` function for specific dates

### Common Tasks

**Add a new computed property:**
```javascript
const myComputed = computed(() => {
  // Your logic here
  return someValue
})
```

**Modify the date check interval:**
```javascript
// In App.vue
const CHECK_INTERVAL_MS = 3600000 // Change this value (in milliseconds)
```

**Change the couple start date:**
```javascript
// In App.vue
const COUPLE_START_DATE = new Date(YEAR, MONTH-1, 18)
// Note: JavaScript months are 0-indexed
```

**Add new UnoCSS utility classes:**
```javascript
// In uno.config.js
shortcuts: {
  'my-custom-class': 'text-xl p-4 bg-blue-500',
}
```

### Best Practices for This Repository

1. **Always run `npm install` before starting development**
2. **Use `npm run dev` for development** - enables hot module replacement
3. **French language**: Keep all user-facing text in French
4. **Component composition**: Keep components small and focused
5. **Reactive patterns**: Use Vue's reactive system, don't manipulate DOM directly
6. **UnoCSS utilities**: Prefer utility classes over custom CSS
7. **Type safety**: Consider adding TypeScript if complexity grows
8. **Test in browser**: Always verify changes in actual browser

### File-Specific Guidelines

**`src/App.vue`:**
- Main application logic and state
- All date calculations live here
- Manages interval for time updates
- Clean up intervals in `onUnmounted()`

**`src/components/AnniversaryDisplay.vue`:**
- Pure presentational component
- Only accepts props, no internal state
- Computes display message from props

**`uno.config.js`:**
- Configure custom colors and shortcuts
- Use theme colors consistently across components
- Animation shortcuts for reusable animations

**`vite.config.js`:**
- Base path set to `'./'` for relative paths
- UnoCSS plugin must be listed before Vue plugin
- Keep configuration minimal

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
