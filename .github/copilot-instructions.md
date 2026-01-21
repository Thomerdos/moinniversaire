# GitHub Copilot Instructions for moinniversaire

## Repository Overview

This is a simple, single-page web application called "moinniversaire" (French for "my anniversary"). The repository contains a static HTML page that checks if the current day is the 18th of the month and displays a special anniversary message for a couple whose relationship started on July 18, 2025.

**Repository Type**: Static web application  
**Size**: Small (single file)  
**Languages**: HTML, CSS (embedded), JavaScript (embedded)  
**Target Runtime**: Web browser  
**Deployment**: Static hosting (GitHub Pages compatible)

## Project Structure

```
.
├── index.html          # Main and only HTML file with embedded CSS and JavaScript
└── .github/            # GitHub configuration directory
    └── copilot-instructions.md  # This file
```

## Key Features

- **Date Checker**: Displays whether today is the 18th of the month
- **Anniversary Tracker**: Calculates and displays months/years together since July 18, 2025
- **Countdown**: Shows days until the next 18th when it's not the 18th
- **Responsive Design**: Mobile-friendly with animations
- **Real-time Updates**: Checks date every hour automatically

## Development Guidelines

### File Organization

- All code is contained in a single `index.html` file
- CSS is embedded in `<style>` tags within the `<head>` section (lines 7-128)
- JavaScript is embedded in `<script>` tags at the end of the `<body>` (lines 140-241)
- The page is in French language (`lang="fr"`)

### Important Constants

When modifying the JavaScript, be aware of these key constants:

- `COUPLE_START_DATE`: Set to `new Date(2025, 6, 18)` (July 18, 2025)
- `ANNIVERSARY_MONTH`: Set to `6` (July, 0-indexed)

### Code Style

- **HTML**: Uses semantic structure with proper indentation
- **CSS**: 
  - Uses CSS custom properties would be inappropriate (not currently used)
  - Mobile-first responsive design with viewport meta tag
  - Animations: `fadeIn`, `bounce`, `pulse` keyframes
  - Two color schemes: `.is-18` and `.not-18` classes on body
- **JavaScript**:
  - Vanilla JavaScript (no frameworks)
  - Functions are well-named and single-purpose
  - Uses French date formatting with `toLocaleDateString('fr-FR')`
  - Updates every hour via `setInterval(checkDate, 3600000)`

### Making Changes

**When modifying the page:**

1. **Testing**: Open `index.html` directly in a web browser to test changes
2. **No Build Step**: This is a static HTML file - no compilation or bundling needed
3. **No Dependencies**: No package.json, no npm install, no node_modules
4. **No Linting**: No configured linters (can use browser DevTools for validation)

**To test date-specific behavior:**

- Modify the JavaScript date logic temporarily, or
- Use browser DevTools to override `new Date()` behavior, or
- Change your system date (not recommended)

### Common Tasks

**Preview the page:**
```bash
# Option 1: Open directly in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a simple HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

**Validate HTML:**
```bash
# No specific validation configured, but you can use online validators
# or browser DevTools console for errors
```

**Check for JavaScript errors:**
- Open browser DevTools (F12)
- Check Console tab for any errors
- Verify date display and animations work correctly

### Key Functions

**Main Functions in JavaScript:**

1. `checkDate()` - Main function that runs on load and every hour
2. `updateDateDisplay()` - Updates the UI based on current date
3. `updateAnniversaryDisplay()` - Shows anniversary message if applicable
4. `getMonthsDifference()` - Calculates months between two dates
5. `getDaysUntilNext18()` - Calculates days until next 18th

### Styling Notes

**CSS Classes:**

- `.container` - Main content wrapper
- `.emoji` - Large animated emoji display
- `.response` - YES/NO answer text
- `.date-info` - Current date display
- `.countdown` - Days until next 18th
- `.anniversary` - Anniversary message (hidden by default)
- `.is-18` / `.not-18` - Body classes that change background gradient
- `.hidden` - Utility class to hide elements

**Animations:**

- `fadeIn` - Container entrance animation (0.6s)
- `bounce` - Emoji bounce effect (1s infinite)
- `pulse` - Anniversary box pulse effect (2s infinite)

### Best Practices for This Repository

1. **Keep it simple**: This is intentionally a single-file application
2. **Maintain responsiveness**: Test on mobile viewports
3. **Preserve animations**: The animations are part of the charm
4. **French language**: Keep all user-facing text in French
5. **No external dependencies**: Don't add libraries unless absolutely necessary
6. **Browser compatibility**: Use widely-supported JavaScript/CSS features

### Validation

**Before committing changes:**

1. Open `index.html` in at least one modern browser (Chrome, Firefox, Safari, Edge)
2. Check the Console for JavaScript errors
3. Verify the page displays correctly on both desktop and mobile viewports
4. Test that animations work smoothly
5. Verify date calculations are correct (if modified)

### Common Modifications

**To change the couple start date:**
```javascript
const COUPLE_START_DATE = new Date(YEAR, MONTH-1, 18);
// Note: JavaScript months are 0-indexed, so January = 0, July = 6
```

**To modify styling:**
- Locate the `<style>` section (lines 7-128)
- Modify CSS properties within the relevant selector
- Test in browser to ensure changes work as expected

**To adjust update frequency:**
```javascript
setInterval(checkDate, MILLISECONDS); // Currently 3600000 = 1 hour
```

### Troubleshooting

**Issue: Date not displaying correctly**
- Check JavaScript console for errors
- Verify date formatting in `toLocaleDateString()` calls
- Ensure browser supports the date formatting options used

**Issue: Animations not working**
- Check if CSS animations are supported in the browser
- Verify keyframe definitions are correct
- Check for any CSS syntax errors

**Issue: Page shows "undefined" or blank values**
- Check JavaScript console for errors
- Verify all DOM elements exist with correct IDs
- Ensure date calculations don't produce NaN

## Additional Notes

- This repository has no CI/CD pipeline configured
- No automated tests are present
- No GitHub Actions workflows exist
- The application is purely client-side with no backend
- No data persistence or cookies are used

When working with this repository, **always test changes by opening the HTML file in a browser** before committing. There are no build or test commands to run.
