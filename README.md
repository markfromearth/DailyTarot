# Daily Tarot

A quiet, interactive 3-card daily tarot reading ritual (_Past, Present, Future_) built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

- **78-Card Tarot Deck**: Full Major and Minor Arcana with upright and reversed interpretations.
- **Interactive Ritual Flow**: Guided state machine (`intro` -> `shuffling` -> `fan` -> `place` -> `read`).
- **3D Card Animations**: Hardware-accelerated 3D card flips, shuffling animations, and interactive fan spread with reduced-motion and keyboard accessibility support.
- **Daily Persistence**: Saves your reading in `localStorage` for the current calendar day and automatically resets on a new day.

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run the test suite
npm run test

# Build for production
npm run build
```
