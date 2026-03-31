<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Portfolio Project

## Project Overview
This is a Next.js 16.2.1 portfolio website built with React 19, TypeScript, and Tailwind CSS 4. The project uses the App Router architecture.

## Tech Stack
- **Framework**: Next.js 16.2.1
- **UI Library**: React 19.2.4
- **Styling**: Tailwind CSS 4 with PostCSS
- **Language**: TypeScript 5
- **Fonts**: Geist Sans & Geist Mono (via next/font/google)

## Project Structure
```
portfolio/
├── app/
│   ├── layout.tsx        # Root layout with font configuration
│   ├── page.tsx          # Home page with animated "Hi cutie" message
│   ├── globals.css       # Global styles and animations
│   └── favicon.ico       # Site favicon
├── public/               # Static assets
├── node_modules/         # Dependencies
└── [config files]        # tsconfig, eslint, next.config, etc.
```

## Current Features
- Animated landing page with "Hi cutie" centered text
- Beautiful gradient background (purple, pink, rose)
- Multiple animation effects:
  - Rotating background orbs
  - Floating particles
  - Rotating and pulsing rings
  - Shimmering gradient text
  - Twinkling sparkles
  - Animated wave at bottom
- Fully responsive design
- Dark theme support

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Animation Details
Custom keyframe animations defined in globals.css:
- `float`: Particles floating up and side to side
- `shimmer`: Gradient text shimmer effect
- `fadeInScale`: Fade in with scale animation
- `twinkle`: Sparkle twinkling effect
- `wave`: Bottom wave animation

## Notes for Agents
- Using Next.js 16 with App Router (not Pages Router)
- Tailwind CSS 4 has different syntax than v3
- All components are Server Components by default
- Use `"use client"` directive only when needed for interactivity
