# AetherCast: Reality Simulation Platform

AetherCast is an immersive web-based reality simulation platform where users interact with a custom scripting language (AethLang) to manipulate simulation parameters through an innovative, magic-inspired terminal interface.

## Features

- **Immersive Introduction Experience**: A multi-stage animated intro sequence that reveals the four fundamental forces of reality: Energy, Probability, Entropy, and Time.
- **Custom Scripting Language**: AethLang allows users to manipulate simulation parameters with an intuitive, magic-inspired syntax.
- **Interactive Terminal**: Command suggestions and autocompletion make spell crafting accessible.
- **Dynamic 3D Visualization**: Powered by React Three Fiber for real-time visual feedback of simulation changes.
- **Mobile-Responsive Design**: Fully functional on both desktop and mobile devices.

## Technology Stack

- **Frontend**: React with TypeScript
- **State Management**: Zustand for lightweight, efficient state handling
- **3D Rendering**: Three.js with React Three Fiber
- **Animation**: Framer Motion for fluid UI animations
- **Styling**: Tailwind CSS with custom utility classes
- **Server**: Express.js for API endpoints

## Project Structure

- `/client`: Frontend React application
  - `/src/components`: UI components including the terminal, simulation grid, and effects
  - `/src/lib`: Core logic including spell parsing and simulation engine
  - `/src/components/intro`: Intro animation sequence components
- `/server`: Backend services
  - `/controllers`: Logic for handling API requests
  - `/routes`: API endpoint definitions
- `/shared`: Types and schemas shared between client and server

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser and navigate to the local development URL

## Using AetherCast

1. Experience the intro sequence to understand the fundamental forces
2. Use the terminal to cast spells and manipulate reality
3. Examples of basic spells:
   ```
   focus Energy with Self shift +10
   focus Probability with Zone(radius=5) shift -2
   focus Entropy with Object(id="particle-1") shift +4
   focus Time with Self shift -1
   ```

## Developer Guide

### Intro Animation Sequence

The intro animation follows these stages:
1. Pulse Effect
2. Star Threads
3. Force Reveals (Energy, Probability, Entropy, Time)
4. Stitch Effect
5. Hidden Whisper (triggered by idle detection)
6. Portal Entry

### Simulation Engine

The simulation engine processes spells by:
1. Parsing the AethLang syntax
2. Validating parameters and energy costs
3. Applying effects to the simulation state
4. Generating visual and audio feedback

### Adding New Spell Types

To add new spell capabilities:
1. Extend the `ParsedSpell` interface in `SpellParser.ts`
2. Add new validation rules
3. Implement effect handlers in `SimulationEngine.ts`
4. Create visual representations in the UI components

## License

AetherCast is provided under the MIT License.