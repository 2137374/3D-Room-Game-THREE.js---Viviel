import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import { PumpkinNPC } from "../../characters/pumpkinNPC.js";
import { showDialogueOptions, hideDialogueOptions } from '../../utils/UI.js';
import { showUIMessage } from '../../utils/UI.js';

export class Room4 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.pumpkins = [];
        this.roomManager = roomManager;
        this.audio = null;
        this.bpm = 78;
        this.audioManager = audioManager;
        this.doors = [
            { position: new THREE.Vector3(1.5, -0.17, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), connection: 7 },
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), connection: 5 },
            { position: new THREE.Vector3(0, -0.17, 1.5), rotation: new THREE.Euler(0, 0, 0), connection: 2 },
            { position: new THREE.Vector3(0, -0.17, -1.5), rotation: new THREE.Euler(0, Math.PI, 0), connection: 9 }
        ];
        this.decorativeObjects = [];
        this.doorObjects = [];
        this.pumpkinDialogues = [
            "Welcome to Room 4! I'm the guardian pumpkin.",
            "Did you know that the rose in this room is special?",
            "It would be nice if you could help us pumpkins rescue all its petals.",
            "When you have all the petals, bring them to the rose.",
            "Explore other rooms, but beware, some pumpkins are rotten by the radiations.",
        ];
        this.lastPress = 501;
        this.isNearPumpkin = false;
        this.gameCompleted = false;
        this.rose = null;
        this.pedestal = null;
    }

    decorate(scene, world) {
        // objects

        // pedestal casts shadow
        this.gltfLoader.load("src/assets/models/blender_3d_for_jobseekers_-_pedestal_example/scene.gltf", (gltf) => {
            this.pedestal = gltf.scene;
            this.pedestal.scale.set(0.2, 0.11, 0.2);
            this.pedestal.position.set(0, -0.5, 0);
            this.pedestal.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                }
            });
            scene.add(this.pedestal);
            this.addDecorativeObject(this.pedestal);
        });

        // black rose
        this.gltfLoader.load("src/assets/models/black_rose.glb", (gltf) => {
            this.rose = gltf.scene;
            this.rose.scale.set(0.2, 0.2, 0.12);
            this.rose.position.set(0, -0.35, 0);
            this.rose.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                }
            });
            scene.add(this.rose);
            this.addDecorativeObject(this.rose);
        });

        // rose box body
        const boxSize = [0.2, 0.5, 0.2];
        const boxShape = new CANNON.Box(new CANNON.Vec3(boxSize[0] / 2, boxSize[1] / 2, boxSize[2] / 2));
        const boxBody = new CANNON.Body({
            mass: 0,
            shape: boxShape,
            position: new CANNON.Vec3(0, -0.27, 0),
            collisionFilterGroup: 1,
            collisionFilterMask: 2
        });
        this.world.addBody(boxBody);
        this.addDecorativeObject(boxBody);

        //light white
        const light = new THREE.SpotLight(0x4169E1, 50, 10, Math.PI / 4, 0.5, 2);
        light.position.set(0, 0.6, 0);
        light.target.position.set(0, -0.3, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        scene.add(light);
        scene.add(light.target);
        this.addDecorativeObject(light);
        this.addDecorativeObject(light.target);

        // Effetto volumetrico per i raggi di luce
        const textureLoader = new THREE.TextureLoader();
        const spotLightTexture = textureLoader.load('src/assets/textures/lighttexture.png');
        const lightConeGeometry = new THREE.ConeGeometry(0.35, 1.3, 32, 1, true);
        const lightConeMaterial = new THREE.MeshBasicMaterial({
            map: spotLightTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            opacity: 0.3
        });
        const lightCone = new THREE.Mesh(lightConeGeometry, lightConeMaterial);
        lightCone.position.set(0, 0.15, 0);
        lightCone.rotation.x = 0;
        scene.add(lightCone);
        this.addDecorativeObject(lightCone);

        //doors
        this.doors.forEach(door => {
            this.gltfLoader.load("src/assets/models/door.glb", (gltf) => {
                const doorModel = gltf.scene;
                doorModel.scale.set(0.0015, 0.0015, 0.0015);
                doorModel.position.copy(door.position);
                doorModel.rotation.copy(door.rotation);
                scene.add(doorModel);
                this.doorObjects.push(doorModel);
                this.addDecorativeObject(doorModel);
            });
        });

        // pumpkin NPC
        const pumpkin7Path = "src/assets/textures/carved_pumpkin/7.png";
        const pumpkin7TalkPath = "src/assets/textures/carved_pumpkin/7talk.png";
        this.pumpkin = new PumpkinNPC(
            scene, 
            new THREE.Vector3(0.8, -0.45, 0.935), 
            this.world,
            pumpkin7Path,
            pumpkin7TalkPath,
            0.2,
            Math.PI,
            this.pumpkinDialogues
        );
        this.pumpkin.onDialogueChange = this.handleDialogueChange.bind(this);
        this.pumpkins.push(this.pumpkin);
        this.addDecorativeObject(this.pumpkin);

        // p7 cardboard box
        this.gltfLoader.load("src/assets/models/cardboard_box.glb", (gltf) => {
            const box = gltf.scene;
            box.scale.set(0.3, 0.3, 0.3);
            box.position.set(-0.33, -0.7, 0.23);
            scene.add(box);
            this.addDecorativeObject(box);
        });

        // over door 2 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number2.glb", (gltf) => {
            const number2 = gltf.scene;
            number2.scale.set(0.01, 0.01, 0.01);
            number2.position.set(0, 0.1, 1.5);
            number2.rotation.y = Math.PI;
            scene.add(number2);
            this.addDecorativeObject(number2);
        });

        // over door 9 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number9.glb", (gltf) => {
            const number9 = gltf.scene;
            number9.scale.set(0.01, 0.01, 0.01);
            number9.position.set(0, 0.1, -1.5);
            number9.rotation.y = 2*Math.PI;
            scene.add(number9);
            this.addDecorativeObject(number9);
        });

        // over door 5 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number5.glb", (gltf) => {
            const number5 = gltf.scene;
            number5.scale.set(0.01, 0.01, 0.01);
            number5.position.set(-1.5, 0.1, 0);
            number5.rotation.y = Math.PI/2;
            scene.add(number5);
            this.addDecorativeObject(number5);
        });

        // over door 6 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number7.glb", (gltf) => {
            const number7 = gltf.scene;
            number7.scale.set(0.01, 0.01, 0.01);
            number7.position.set(1.5, 0.1, 0);
            number7.rotation.y = -Math.PI/2;
            scene.add(number7);
            this.addDecorativeObject(number7);
        });
    }

    getDoors() {
        return this.doors;
    }

    handleDialogueChange(dialogueOptions) {
        if (dialogueOptions) {
            console.log("Showing dialogue:", dialogueOptions);
            showDialogueOptions(dialogueOptions);
        } else {
            hideDialogueOptions();
        }
    }

    update(deltaTime, playerPosition) {
        super.update(deltaTime);
        if (this.audioManager && this.audioManager.sounds['background'] && this.audioManager.sounds['background'].isPlaying) {
            const time = this.audioManager.getAudioContext().currentTime;
            const beat = (time * this.bpm / 60) % 1;
    
            this.pumpkins.forEach(pumpkin => {
                pumpkin.update(deltaTime, beat);
            });
        }
        if (this.rose && playerPosition && !this.gameCompleted) {
            const distanceToRose = playerPosition.distanceTo(this.rose.position);
            if (distanceToRose < 0.5) {
                if (this.roomManager.player.hasAllPetalsCollected()) {
                    showUIMessage("Press E to complete the game");
                    if (this.input.keys['e']) {
                        if (!this.gameCompleted) {
                            this.gameCompleted = true;
                            if (typeof window.completeGame === 'function') {
                                window.completeGame();
                            }
                        }
                    }
                } else {
                    showUIMessage("You need to collect all petals first");
                }
            }
        }
        this.roomManager.checkPumpkinInteraction(playerPosition, this.pumpkinDialogues);
    }


    removeFromScene(scene) {
        super.removeFromScene(scene);

        this.decorativeObjects.forEach(obj => {
            if (obj instanceof THREE.Object3D) {
                scene.remove(obj);
            } else if (obj instanceof CANNON.Body) {
                this.world.removeBody(obj);
            }
        });

        this.pumpkins.forEach(pumpkin => {
            pumpkin.removeFromScene(scene);
            this.world.removeBody(pumpkin.body);
        });

        this.doorObjects.forEach(door => {
            scene.remove(door);
        });

        this.decorativeObjects = [];
        this.pumpkins = [];
        this.doorObjects = [];

        console.log('Room 4 cleaned up');
    }
}