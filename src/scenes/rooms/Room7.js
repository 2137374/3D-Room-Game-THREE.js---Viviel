import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { PumpkinNPC } from "../../characters/pumpkinNPC.js";
import { showUIMessage } from "../../utils/UI.js";

export class Room7 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.scene = roomManager.scene;
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.pumpkins = [];
        this.vase = null;
        this.flower = null;
        this.audio = null;
        this.bpm = 78;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), connection: 8 },
            { position: new THREE.Vector3(0, -0.17, 1.5), rotation: new THREE.Euler(0, 0, 0), connection: 4 }
        ];
        this.pumpkinDialogues = ["test"];
        this.flower = null;
    }

    decorate(scene, world) {
        //doors
        this.scene = scene;
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

        // pumpkin NPC
        const pumpkin16Path = "src/assets/textures/carved_pumpkin/1.png";
        const pumpkin16TalkPath = "src/assets/textures/carved_pumpkin/1.png";
        this.pumpkin = new PumpkinNPC(
            scene, 
            new THREE.Vector3(-0.99, -0.45, 0.5), 
            this.world,
            pumpkin16Path,
            pumpkin16TalkPath,
            0.2,
            Math.PI/2,
            this.pumpkinDialogues
        );
        this.pumpkins.push(this.pumpkin);
        this.addDecorativeObject(this.pumpkin);

        // p7 cardboard box
        this.gltfLoader.load("src/assets/models/cardboard_box.glb", (gltf) => {
            const box = gltf.scene;
            box.scale.set(0.3, 0.3, 0.3);
            box.position.set(-2.1, -0.7, -0.2);
            scene.add(box);
            this.addDecorativeObject(box);
        });

        // over door 4 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number4.glb", (gltf) => {
            const number4 = gltf.scene;
            number4.scale.set(0.01, 0.01, 0.01);
            number4.position.set(0, 0.1, 1.5);
            number4.rotation.y = Math.PI;
            scene.add(number4);
            this.addDecorativeObject(number4);
        });

        // over door 8 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number8.glb", (gltf) => {
            const number8 = gltf.scene;
            number8.scale.set(0.01, 0.01, 0.01);
            number8.position.set(-1.5, 0.1, 0);
            number8.rotation.y = Math.PI/2;
            scene.add(number8);
            this.addDecorativeObject(number8);
        });

        //flower 
        this.gltfLoader.load("src/assets/models/generic_narcissus_flower/scene.gltf", (gltf) => {
            const flower = gltf.scene;
            flower.scale.set(0.01, 0.01, 0.01);
            flower.position.set(0.5, -0.42, 1);
            scene.add(flower);
            this.addDecorativeObject(flower);
            this.flower = flower;
        });

        // vase
        this.gltfLoader.load("src/assets/models/marble_vase_low_poly.glb", (gltf) => {
            this.vase = gltf.scene;
            this.vase.scale.set(0.0005, 0.0005, 0.0005);
            this.vase.position.set(0.514, -0.5, 1);
            this.vase.rotation.y = Math.PI;
            this.vase.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(this.vase);
            this.addDecorativeObject(this.vase);
        });
    }

    getDoors() {
        return this.doors;
    }

    update(deltaTime, playerPosition) {
        if (this.audioManager && this.audioManager.sounds['background'] && this.audioManager.sounds['background'].isPlaying) {
            const time = this.audioManager.getAudioContext().currentTime;
            const beat = (time * this.bpm / 60) % 1;
    
            this.pumpkins.forEach(pumpkin => {
                pumpkin.update(deltaTime, beat);
            });
        }
        if (this.flower && playerPosition.distanceTo(this.flower.position) < 0.5) {
            showUIMessage("Press E to pick up the flower");
            if (this.input.keys['e']) {
                this.pickupFlower(playerPosition);
            }
        }
    }

    pickupFlower(playerPosition) {
        if (this.flower && this.scene) {
            this.scene.remove(this.flower);
            this.flower = null;
            this.roomManager.player.isHoldingFlower = true;
            showUIMessage("You picked up the flower!");
        }
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);

        this.pumpkins.forEach(pumpkin => {
            pumpkin.removeFromScene(scene);
            this.world.removeBody(pumpkin.body);
        });

        this.pumpkins = [];

        if (this.audioManager) {
            this.audioManager.stopAllSounds();
        }

        if (this.flower) {
            scene.remove(this.flower);
        }

        console.log('Room 7 cleaned up');
    }
}