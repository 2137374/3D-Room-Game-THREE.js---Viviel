import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { showUIMessage } from "../../utils/UI.js";

export class Room1 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.trapTimer = null;
        this.audio = null;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), connection: 2 }
        ];  
    } 

    decorate(scene, world) {
        this.startTime = Date.now();
        super.decorate(scene, world);
        //doors
        this.doors.forEach(door => {
            this.gltfLoader.load("src/assets/models/door.glb", (gltf) => {
                const doorModel = gltf.scene;
                doorModel.scale.set(0.0015, 0.0015, 0.0015);
                doorModel.position.copy(door.position);
                doorModel.rotation.copy(door.rotation);
                scene.add(doorModel);
                this.addDecorativeObject(doorModel);
            });
        });

        const gas = new THREE.FogExp2(0x00ff02, 0.5);
        scene.fog = gas;  
    }

    getDoors() {
        return this.doors;
    }

    update(deltaTime, player) {
        super.update(deltaTime, player);
        const elapsedTime = Date.now() - this.startTime;
        if (elapsedTime > 2000 && !this.gameOverTriggered) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.gameOverTriggered = true;
        showUIMessage('GAME OVER. \n You died in the gas. \n Do not trust all pumpkins', true);
        if (typeof window.showGameOver === 'function') {
            window.showGameOver();
        }
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);
        if (this.audioManager) {
            this.audioManager.stopAllSounds();
        }

        console.log('Room 1 cleaned up');
    }

    reset() {
        this.startTime = Date.now();
        this.gameOverTriggered = false;
    }
}