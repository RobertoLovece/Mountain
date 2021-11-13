# Mountain 🏔

![Mountain](https://user-images.githubusercontent.com/48356710/141651951-d8abea43-6987-4604-b241-77397d067667.png)

## Live Demo
- https://robertolovece.github.io/Mountain/

## Overview

- The mountain is procedurally generated using Fractional Brownian motion (https://en.wikipedia.org/wiki/Fractional_Brownian_motion) inside a vertex shader of a flat plane.
- Due to the high amount of polygon to achieve a realistic product, it will have trouble running on low-end/older phones or computers.
- Because of the way the snow is generated on the terrain, moving the camera changes the position/effect of the snow.

## Instructions

- You can use the GUI to configure both the snow on the mountain as well as the snow fall and fog effect. 
- The project also has Three.js OrbitControls to allow movement of the camera by dragging.

## Installation
__Requires npm (https://www.npmjs.com/)__

- __Install__ - npm i

- __Run__ - npm run start
