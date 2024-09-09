import * as THREE from 'three';

export class Input {
    constructor() {
        this.mouseMovement = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.isRightMouseDown = false;
        this.isShiftDown = false;
        this.mousePosition = { x: 0, y: 0 };
        this.wheelData = 0;
        this.keys = {
            w : false,
            a : false,
            s : false,
            d : false,
            Space : false,
            p: false,
            t: false,
            e: false,
            f: false
        };

        this.initEventListeners();
    }

    initEventListeners() {
        window.addEventListener('mousemove', (event) => {
            this.mouseMovement.x = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            this.mouseMovement.y = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        });

        window.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) { this.keys[key] = true; }
        });

        window.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) { this.keys[key] = false; }
        });

        window.addEventListener('mousedown', (event) => {
            // shoot
            if (event.button === 0) { this.isMouseDownLeft = true; }
            // aim
            if (event.button === 2) { this.isRightMouseDown = true; }
        });

        window.addEventListener('mouseup', (event) => {
            // shoot
            if (event.button === 0) { this.isMouseDownLeft = false; }
            // aim
            if (event.button === 2) { this.isRightMouseDown = false; }
        });

        window.addEventListener('wheel', (event) => {
            this.wheelData = event.deltaY;
        });
    }

    getMovementVector() {
        const forward = this.keys['w'] ? 1 : 0;
        const backward = this.keys['s'] ? -1 : 0;
        const right = this.keys['d'] ? -1 : 0;
        const left = this.keys['a'] ? 1 : 0;

        const moveX = right + left;
        const moveZ = forward + backward;
        const moveVector = new THREE.Vector3(moveX, 0, moveZ);

        return moveVector; 
    }

    clearWheel() {
        this.wheelData = 0;
    }
    
    resetMouseMovement() {
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
    }
}

export const input = new Input(); 
