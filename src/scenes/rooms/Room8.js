import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { RottenPumpkin } from "../../characters/rottenPumpkin.js";
import { showUIMessage } from "../../utils/UI.js";
import { input } from "../../controllers/Input.js";
import * as CANNON from "cannon-es";

export class Room8 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.audio = null;
        this.bpm = 78;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), connection: 7 },
            { position: new THREE.Vector3(0, -0.17, 1.5), rotation: new THREE.Euler(0, 0, 0), connection: 9 }
        ];
        this.rottenPumpkin = null;
        this.flower = null;
        this.input = input;
        this.pendingFlowerDrop = false;
        this.lastPlayerPosition = null;
        this.scene = roomManager.scene;
        this.petal = null;
    }

    decorate(scene, world) {
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

        // petal stand
        this.gltfLoader.load("src/assets/models/round_stand_free.glb", (gltf) => {
            this.stand = gltf.scene;
            this.stand.scale.set(0.002, 0.002, 0.002);
            this.stand.position.set(0.5, -0.5, 0.5);
            this.stand.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                }
            });
            scene.add(this.stand);
            this.addDecorativeObject(this.stand);
        });

        const boxSize = [0.1, 0.2, 0.1];
        const boxShape = new CANNON.Box(new CANNON.Vec3(boxSize[0] / 2, boxSize[1] / 2, boxSize[2] / 2));
        const boxBody = new CANNON.Body({
            mass: 0,
            shape: boxShape,
            position: new CANNON.Vec3(0.5, -0.5, 0.5),
            collisionFilterGroup: 1,
            collisionFilterMask: 2
        });
        this.world.addBody(boxBody);
        this.addDecorativeObject(boxBody);

        // petal
        this.gltfLoader.load("src/assets/models/petal_flower_rose/scene.gltf", (gltf) => {
            this.petal = gltf.scene;
            this.petal.scale.set(0.01, 0.01, 0.01);
            this.petal.position.set(0.5, -0.35, 0.5);
            this.petal.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                }
            });
            scene.add(this.petal);
            this.addDecorativeObject(this.petal);
        });

        //light blue
        const light = new THREE.SpotLight(0x4169E1, 10, 5, Math.PI / 8, 0.25, 1);
        light.position.set(0, 0.6, 0);
        light.target.position.set(0.5, -0.35, 0.5);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        scene.add(light);
        scene.add(light.target);
        this.addDecorativeObject(light);
        this.addDecorativeObject(light.target);

        // rotten pumpkin
        const rottenPumpkinTexture = "src/assets/textures/jack-o-lantern/24.png";
        this.rottenPumpkin = new RottenPumpkin(
            scene,
            new THREE.Vector3(0, 0, -1.1),
            this.world,
            rottenPumpkinTexture
        );
        this.addDecorativeObject(this.rottenPumpkin);

        // over door 9 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number9.glb", (gltf) => {
            const number9 = gltf.scene;
            number9.scale.set(0.01, 0.01, 0.01);
            number9.position.set(0, 0.1, 1.5);
            number9.rotation.y = Math.PI;
            scene.add(number9);
            this.addDecorativeObject(number9);
        });

        // over door 7 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number7.glb", (gltf) => {
            const number7 = gltf.scene;
            number7.scale.set(0.01, 0.01, 0.01);
            number7.position.set(-1.5, 0.1, 0);
            number7.rotation.y = Math.PI/2;
            scene.add(number7);
            this.addDecorativeObject(number7);
        });
    }

    getDoors() {
        return this.doors;
    }

    update(deltaTime, playerPosition) {
        super.update(deltaTime)

        if (playerPosition) {
            this.lastPlayerPosition = playerPosition.clone();
        }

        if (this.rottenPumpkin) {
            const flowerPosition = this.flower ? this.flower.position : null;
            const playerCaught = this.rottenPumpkin.update(deltaTime, playerPosition, flowerPosition);
            if (playerCaught) {
                this.triggerGameOver();
            }
        }

        if (this.roomManager.player.isHoldingFlower) {
            showUIMessage("Press F to drop the flower");
            if (this.input.keys['f']) {
                this.pendingFlowerDrop = true;
            }
        }

        if (this.pendingFlowerDrop && this.lastPlayerPosition) {
            this.dropFlower(this.lastPlayerPosition);
            this.pendingFlowerDrop = false;
        }

        if (this.petal && playerPosition.distanceTo(this.petal.position) < 0.3) {
            showUIMessage("Press E to pick up the petal");
            if (this.input.keys['e']) {
                this.pickupPetal(playerPosition);
            }
        }
    }

    triggerGameOver() {
        showUIMessage('GAME OVER. \n The rotten pumpkin caught you!', true);
        if (typeof window.showGameOver === 'function') {
            window.showGameOver();
        }
    }


    dropFlower(position) {
        if (this.roomManager.player.isHoldingFlower && position) {
            this.gltfLoader.load("src/assets/models/generic_narcissus_flower/scene.gltf", (gltf) => {
                const flower = gltf.scene;
                flower.scale.set(0.01, 0.01, 0.01);
                this.flower = flower;
                this.flower.position.copy(position);
                this.addDecorativeObject(flower);
                this.roomManager.player.isHoldingFlower = false;
            });
            this.scene.add(this.flower);
            showUIMessage("You dropped the flower!");
        }
    }

    pickupPetal(playerPosition) {
        if (this.petal && this.scene) {
            this.scene.remove(this.petal);
            this.petal = null;
            this.roomManager.player.addPetal();
            showUIMessage("You picked up the petal!");
        }
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);
        if (this.rottenPumpkin) {
            this.rottenPumpkin.removeFromScene();
        }
        if (this.flower) {
            scene.remove(this.flower);
        }
    }
}