# Yuva Construction Website

A professional 5-page construction company website built with React.js.

## Pages
- **Home** — Hero with particle animation, typewriter effect, animated counters, marquee ticker
- **About** — Company story, animated skill bars, feature highlights
- **Services** — 6 service cards with hover animations
- **Team** — 25 team members filterable by department
- **Projects** — 6 projects filterable by category
- **Contact** — Contact form with loading state

## Getting Started

### Prerequisites
- Node.js (v14 or higher) — download from https://nodejs.org
- npm (comes with Node.js)

### Installation & Running

1. Open this folder in VS Code
2. Open the integrated terminal (Ctrl + ` or View > Terminal)
3. Run the following commands:

```bash
npm install
npm start
```

4. The website will open automatically at http://localhost:3000

### Build for Production

```bash
npm run build
```

## Tech Stack
- React 18
- CSS animations (IntersectionObserver scroll reveals, keyframe animations)
- Canvas API (particle network)
- Google Fonts (Playfair Display + Barlow)
- Unsplash images (loaded from CDN)

## Project Structure
```
yuva-construction/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx        ← Main website component
│   ├── index.js       ← React entry point
│   └── index.css      ← Base styles
├── package.json
└── README.md
```
