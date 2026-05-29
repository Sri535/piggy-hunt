# 🐷 Piggy Hunt Adventure 3D

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform: Mobile & Desktop](https://img.shields.io/badge/Platform-Mobile%20%7C%20Desktop-blue.svg)]()
[![Engine: Three.js](https://img.shields.io/badge/Engine-Three.js%20(r160)-lightgrey.svg)](https://threejs.org/)
[![Hosting: GitHub Pages](https://img.shields.io/badge/Hosting-GitHub%20Pages-green.svg)]()

An immersive, highly optimized 3D treasure-hunting browser game featuring real-time hardware gyroscope tracking for mobile devices and standard FPS-style pointer controls for desktop browsers. Explore dynamic procedural environments, hunt unique piggy variations, and level up your skills.

---

## 🚀 Live Demo

Play the production version instantly here: 
👉 **[Deploy Link - Replace with your GitHub Pages URL]**

---

## 📱 Features & Target Capabilities

### Cross-Platform Architecture
*   **Mobile (iOS/Android):** Full 360° environment tracking via the **Web Device Orientation API**. Touch interaction to capture targets.
*   **Desktop:** Seamless **Pointer Lock API** integration for full-screen mouse look alongside classic `WASD` / Arrow keys keyboard navigation.
*   **Universal Responsive HUD:** Glassmorphic UI overlays built to morph perfectly across extra-wide desktop rigs, iPads, and compact mobile phone displays.

### Performance & Graphical Pipeline
*   **Target Frame Rate:** Stable 60 FPS running natively via WebGL.
*   **Adaptive Resolution Pipeline:** Pixel-ratio capping limits high-density retina/AMOLED screens from unnecessarily throttling mobile GPUs.
*   **Zero Asset Overhead:** Uses purely procedural textures, geometries, lighting maps, and synthesized **Web Audio API** triggers. This ensures instant load times even over weak 3G/4G cellular connections.
*   **PWA Ready:** Configured to support offline execution, custom app-shell launch parameters, and a standalone app environment on mobile home screens.

---

## 📁 Repository Structure

```text
Piggy-Hunt-Adventure/
├── index.html          # Core Application HTML & UI Overlays
├── style.css           # Premium Glassmorphic Layouts & Neon Micro-interactions
├── game.js             # Core Engine Lifecycle (Three.js Loop, Shaders, Input Routing)
├── manifest.json       # Progressive Web App Configuration Manifest
└── README.md           # Documentation & Engineering Blueprint
```
---
## Visitor Stats

![Views](https://komarev.com/ghpvc/?username=Sri535&color=brightgreen)
![Visitor Badge](https://visitor-badge.laobi.icu/badge?page_id=piggy-hunt)
