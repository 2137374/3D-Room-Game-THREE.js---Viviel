# 3D Room Game THREE.JS - Viviel

A 3D adventure game built with Three.js, developed as a project for the Interactive Graphics course at Sapienza University of Rome, given by Professor Paolo Russo.

![Game Screenshot](/src/assets/textures/wallpaper.png)

## 🎮 Game Overview

In this immersive 3D adventure, players explore interconnected rooms while collecting rose petals to restore a sacred relic. The game features interactive NPCs represented as pumpkins, offering both help and obstacles throughout the journey. The objective is to restore a mystical rose to its original sacred state by collecting all its scattered petals.

### Combat System
- Ray tracing implementation for precise hit detection
- Hitbox visualization system for debugging (`enemySkeleton.js`)
- Real-time collision detection between projectiles and enemies
- Debug visualization tools for hitboxes and collision areas
- Skeleton enemy AI with proximity-based attack patterns
- Location: `src/characters/enemySkeleton.js`

### Input and Controls

#### Basic Controls
- `W/A/S/D`: Movement
- `Mouse`: Look around
- `Left Click`: Shoot
- `Right Click`: Aim
- `P`: Enter doors
- `T`: Talk to pumpkins
- `E`: Interact with objects
- `ESC`: Pause menu

#### Debug Controls
For developers:
- Toggle hitbox visualization in `enemySkeleton.js`
- Customizable animation parameters through GUI
- Real-time pose control system for character animations

### Character Movement
- Smooth camera following with collision detection
- Physics-based movement system
- Dynamic rotation handling
- Reference: `src/controllers/characterMovement.js`

### Development Tools

#### Debug Features
- Hitbox visualization for enemies
- Animation control GUI
- Pose saving/loading system
- Real-time physics debugging

For detailed implementation of specific systems, refer to:
- Combat System: `src/characters/enemySkeleton.js`
- Movement Controls: `src/controllers/Input.js`
- Character Physics: `src/controllers/characterMovement.js`
- Room Generation: `src/scenes/RoomBase.js`

## 🛠️ Technical Implementation

### Core Technologies
- Three.js for 3D graphics rendering
- Cannon.js for physics simulation
- Custom animation system with a mix of IK (Inverse Kinematics) and keyframing through interpolation
- Modular room-based architecture

### Key Technical Features

#### Animation System
- Hybrid animation system combining procedural and keyframe animations
- IK (Inverse Kinematics) implementation using CCDIKSolver
- Custom pose control system with GUI for animation debugging and keyframing
- Real-time pose interpolation for smooth transitions
- Location: `src/animations/HybridAnimationSystem.js`, `ShootAnimationSystem.js`, `...`

#### Character System
- Physics-based character controller with collision detection
- Shooting mechanics using raycasting
- State-based animation management
- Bone-based animation system with pose interpolation
- See: `src/characters/characterModel.js`

#### Room Management 
- Dynamic room loading and unloading system
- Room-based state management
- Efficient memory handling through object pooling
- Reference: `src/scenes/RoomManager.js`, `RoomBase.js`

#### Combat & Interaction Systems
- Ray tracing implementation for precise shooting mechanics
- Real-time collision detection
- Environmental interaction system
- Audio management with spatial sound
- Check: `src/controllers/Combat.js`, `Audio.js`

## 🚀 Future Development Potential

The modular architecture allows for:
- Additional rooms and gameplay mechanics
- Enhanced NPC behavior systems
- Extended combat mechanics
- More complex puzzle implementations
- Fine tuning of esthetics and artistic side

## 🏗️ Project Structure

```
vivielgame/
├── src/
│   ├── animations/      # Animation systems and controllers
│   ├── characters/      # Character and NPC implementations
│   ├── controllers/     # Game input and physics controllers
│   ├── scenes/          # Room management and scene setup
│   └── utils/           # Utility functions and helpers
├── assets/
│   ├── models/         # 3D models and animations
│   ├── textures/       # Game textures
│   └── audio/          # Sound effects and music
```

## 🔧 Setup and Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vivielgame.git

# Open the repository on VS code

# Launch index.html as a live server option, prefer the use of Mozilla Firefox browser or Google Chrome Browser

# Play
```

## 📝 License

Copyright (c) 2024 [Il tuo nome] - All Rights Reserved

### Software License

This software and its source code are proprietary and confidential.
No part of this software, including its source code and assets, may be reproduced, distributed, or transmitted in any form or by any means, without the prior written permission of the copyright holder, except:
- For personal, non-commercial use
- For educational purposes and code study
- For the creation of derivative works for personal use only

Redistribution of the game, in whole or in part, is strictly prohibited without explicit written permission.

### Assets Rights

#### Proprietary Assets
The following assets are proprietary and all rights are reserved:
- viviel.ico
- wallpaper.png
- Character 3D model (created in collaboration with Francesco Renica)

#### Third-Party Assets
This software includes third-party assets subject to their respective licenses:

## 🎨 Credits

### Development Team
- Game Design & Programming: [Leonardo Sandri]
- Character Design: Leonardo Sandri & Francesco Renica

### Third-Party Assets
#### 3D Models
- **Skeleton Character**
  - Source: [Skeleton Character PSX](https://sketchfab.com/3d-models/skeleton-character-psx-ece576bbed4b4364911c7596d828a558)

- **Gold Revolver**
  - Source: [Gold Revolver Low Poly](https://sketchfab.com/3d-models/gold-revolver-low-poly-f35077e69b034c198fd23ef1878a9594)

- **Door**
  - Source: [Door Model](https://sketchfab.com/3d-models/door-2738468b94d74c5f827e7e5df7be8359)

- **Black Rose**
  - Source: [Black Rose](https://sketchfab.com/3d-models/black-rose-b2cd9e577cfb4986946773cee5f641ad)

- **Pedestal**
  - Source: [Blender 3D Pedestal](https://sketchfab.com/3d-models/blender-3d-for-jobseekers-pedestal-example-4812321b0c2a43ab8df117fb383a5319)

- **Cardboard Boxes**
  - Source: [Single Box](https://sketchfab.com/3d-models/cardboard-box-a30803bf02f341a484cecd88daa780f1)
  - Source: [Box Set](https://sketchfab.com/3d-models/set-of-cardboard-boxes-8986ba512f704ac5b253286a0d1ad8bb)

- **Flower Assets**
  - Source: [Generic Narcissus Flower](https://sketchfab.com/3d-models/generic-narcissus-flower-cf16e483ce7b4b9281b62366d9b1e52c)
  - Source: [Petal Flower Rose](https://sketchfab.com/3d-models/petal-flower-rose-65aaa97c69d74384a36ff9ee5a4e7e5f)

- **Additional Models**
  - Source: [Round Stand](https://sketchfab.com/3d-models/round-stand-free-5734834b9c0d436c9b581cf2257666bf)
  - Source: [Gun Targets](https://sketchfab.com/3d-models/gun-targets-eb9fbe283faa41ef8685359a0769d303)
  - Source: [Pumpkins Model](https://sketchfab.com/3d-models/pumpkins-model-577dd8241f4846988e068aeefb189346)
  - Source: [Marble Vase](https://sketchfab.com/3d-models/marble-vase-low-poly-42b3ce5985974be986f52dcca5b590ef)

#### Texture Packs
- **Pumpkin Faces**
  - Source: [More Pumpkin Faces](https://www.planetminecraft.com/texture-pack/more-pumpkin-faces/)

#### Development Resources
- Third Person Camera Implementation inspired by: [YouTube Tutorial](https://www.youtube.com/watch?v=EkPfhzIbp2g&list=PLRL3Z3lpLmH0aqLDbfh0ZmnDkpXPDnTau&index=7)

### Technologies Used
- Three.js - 3D Graphics Engine
- Cannon.js - Physics Engine
- dat.GUI - Debug Interface
- Additional libraries listed in package.json

### Special Thanks
- Professor Paolo Russo - Interactive Graphics Course, Sapienza University of Rome
- Francesco Renica - [LinkedIn](https://it.linkedin.com/in/francesco-renica-451401305)

### Note
This game was developed as a project for the Interactive Graphics course at Sapienza University of Rome. All rights reserved.

## 🤝 Contributing
No contribution is considered by now, if interested contact me at leonardosandri99@gmail.com
