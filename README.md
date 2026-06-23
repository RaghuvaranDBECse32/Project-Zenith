# Project Zenith: Real-Time Orbital Mechanics & Visualization

**Project Zenith** is a high-fidelity, interactive space-tracking platform designed to provide real-time planetary mechanics, artificial satellite monitoring, and cinematic 3D rendering. Developed as part of the **SRMIST AARUUSH '26 National Technical Championship**, this project integrates live telemetry with a high-performance 3D engine to deliver an immersive astronomical experience.

## 🚀 Overview
Project Zenith serves as an advanced astronomical dashboard. It tracks orbital trajectories, monitors satellite positions via real-time data streams, and provides an orthographic radar system for precise geodetic observation.

* **Status:** Qualified for Round 2 Development Sprint
* **Championship:** SRMIST Aaruush '26
* **Submission Score:** 98.40/100

## 🛠 Tech Stack
Project Zenith leverages a modern, high-performance web development stack:

* **Framework:** [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/) for type-safe, component-based architecture.
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for responsive, performant UI and theme management.
* **Build Tool:** [Vite](https://vitejs.dev/) for high-speed module replacement and optimized bundling.
* **Integration:** Gemini API for cognitive celestial reasoning and stargazing analysis.

## 📡 Data Strategy
The platform ensures accuracy through active data pipelines:
1.  **NASA Horizons:** For planetary ephemeris and precise celestial position vectors.
2.  **OpenNotify:** For live International Space Station (ISS) tracking and low-orbit altitude mapping.
3.  **CelesTrak:** For processing Two-Line Element (TLE) datasets of over 6,000 active satellites.

## 📐 Celestial Visibility Calculation
The engine determines the visibility of astronomical objects using the following logic:

* **Formula:** * $\alpha$ = Azimuth(Observer, Object)
    * $\varepsilon$ = Elevation(Observer, Object)
* **Condition:** Visible if $\varepsilon > 0^\circ$ (Above Horizon limit).
* **Viability Index:** $(\text{Seeing Value} \times 20) - \text{Cloud Cover}\%$.

## 📅 Development Roadmap
| Phase | Focus | Status |
| :--- | :--- | :--- |
| **Week 1** | Data documentation & TLE vector blueprints | Completed |
| **Week 2** | Radar coordinates plotter & UI mockups | Completed |
| **Week 3-4** | Live backend sync & AI analysis modules | **In Progress** |

## 💡 Contact
For inquiries regarding this project or the AstralWeb Innovate portfolio, please reach out to:
**Candidate:** [raghuvarandamodaran2002@gmail.com](mailto:raghuvarandamodaran2002@gmail.com)
**Website:** (https://project-zenith-bice.vercel.app/)


)
---
*© 2026 AstralWeb Innovate. All Rights Reserved.*
