import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { PumpkinNPC } from "../../characters/pumpkinNPC.js";
import { EnemySkeleton } from "../../characters/enemySkeleton.js";
import { showUIMessage, hideUIMessage, showDialogueOptions, hideDialogueOptions } from "../../utils/UI.js";
import * as CANNON from "cannon-es";

export class Room5 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.pumpkins = [];
        this.skeletons = [];
        this.id = config.id;
        this.audio = null;
        this.petal = null;
        this.stand = null;
        this.bpm = 78;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), connection: 4 }
        ];
        this.pumpkinDialogues = [
            "Help me! Please kill the skeletons!",
            "Be careful, they're dangerous!",
            "You're our only hope to defeat them.",
            "Thank you for your bravery!"
        ];
        this.allSkeletonsDefeated = false;

        this.handleCharacterShoot = this.handleCharacterShoot.bind(this);
        window.addEventListener('character-shoot', this.handleCharacterShoot);
    }

    decorate(scene, world) {
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

        // petal stand
        this.gltfLoader.load("src/assets/models/round_stand_free.glb", (gltf) => {
            this.stand = gltf.scene;
            this.stand.scale.set(0.002, 0.002, 0.002);
            this.stand.position.set(-0.5, -0.5, -0.5);
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
            // shadow
        });

        const boxSize = [0.1, 0.2, 0.1];
        const boxShape = new CANNON.Box(new CANNON.Vec3(boxSize[0] / 2, boxSize[1] / 2, boxSize[2] / 2));
        const boxBody = new CANNON.Body({
            mass: 0,
            shape: boxShape,
            position: new CANNON.Vec3(-0.5, -0.5, -0.5),
            collisionFilterGroup: 1,
            collisionFilterMask: 2
        });
        this.world.addBody(boxBody);
        this.addDecorativeObject(boxBody);

        // petal
        this.gltfLoader.load("src/assets/models/petal_flower_rose/scene.gltf", (gltf) => {
            this.petal = gltf.scene;
            this.petal.scale.set(0.01, 0.01, 0.01);
            this.petal.position.set(-0.5, -0.35, -0.5);
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

        //light white
        const light = new THREE.SpotLight(0x4169E1, 10, 5, Math.PI / 8, 0.25, 1);
        light.position.set(0, 0.6, 0);
        light.target.position.set(-0.5, -0.35, -0.5);
        light.castShadow = true;
        light.shadow.mapSize.width = 512;
        light.shadow.mapSize.height = 512;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500;
        scene.add(light);
        scene.add(light.target);
        this.addDecorativeObject(light);
        this.addDecorativeObject(light.target);

        // pumpkin NPC
        const pumpkin16Path = "src/assets/textures/carved_pumpkin/6.png";
        const pumpkin16TalkPath = "src/assets/textures/carved_pumpkin/6.png";
        this.pumpkin = new PumpkinNPC(
            scene, 
            new THREE.Vector3(-0.99, -0.45, 0.5), 
            this.world,
            pumpkin16Path,
            pumpkin16TalkPath,
            0.2,
            Math.PI/2,
            this.pumpkinDialogues,
        );
        this.pumpkin.onDialogueChange = this.handleDialogueChange.bind(this);
        this.pumpkins.push(this.pumpkin);
        this.addDecorativeObject(this.pumpkin)

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
            number4.position.set(-1.5, 0.1, -0.025);
            number4.rotation.y = Math.PI/2;
            scene.add(number4);
            this.addDecorativeObject(number4);
        });

        this.spawnSkeletons(scene, world);

        window.addEventListener('character-shoot', this.handleCharacterShoot.bind(this));
        showUIMessage("Help the pumpkin, kill the skeletons");
        setTimeout(() => hideUIMessage(), 2500);
    }

    handleDialogueChange(dialogueOptions) {
        if (dialogueOptions) {
            console.log("Showing dialogue:", dialogueOptions);
            showDialogueOptions(dialogueOptions);
        } else {
            hideDialogueOptions();
        }
    }

    spawnSkeletons(scene, world) {
        const spawnPositions = [
            new THREE.Vector3(-1, 0, 1),
            new THREE.Vector3(-1.2, 0, 1),
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(-1, 0, -1.2)
        ];

        spawnPositions.forEach(position => {
            const skeleton = new EnemySkeleton(scene, world, position);
            this.skeletons.push(skeleton);
        });
    }

    getDoors() {
        return this.doors;
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

        if (this.skeletons) {
            this.skeletons.forEach(skeleton => {
                skeleton.update(deltaTime, playerPosition);
            });

            this.checkPlayerDamage(playerPosition);
        }
        this.roomManager.checkPumpkinInteraction(playerPosition, this.pumpkinDialogues);
    }

    handleCharacterShoot(event) {
        const { raycaster, position, direction, currentRoomId } = event.detail;
        console.log('Shoot event received in Room5. Current room:', this.id, 'Event room:', currentRoomId);

        if (currentRoomId !== this.id) {
            console.log('Room mismatch, ignoring event');
            return;
        }

        const ray = new THREE.Ray(position, direction);

        this.skeletons.forEach(skeleton => {
            if (skeleton.mesh) {
                const intersectionPoint = new THREE.Vector3();
                if (ray.intersectSphere(skeleton.hitBox, intersectionPoint)) {
                    skeleton.takeDamage();
                    console.log('Skeleton hit!');
                    if (skeleton.hp <= 0) {
                        this.removeSkeletonFromScene(skeleton);
                    }
                }
            }
        });
        this.checkAllSkeletonsDefeated();
    }

    checkAllSkeletonsDefeated() {
        if (this.skeletons.length === 0 && !this.allSkeletonsDefeated) {
            this.allSkeletonsDefeated = true;
            this.rewardPlayerWithPetal();
        }
    }

    rewardPlayerWithPetal() {
        showUIMessage("All skeletons killed! The pumpkin rewards you with a petal.");
        if (this.roomManager.player.getPetalCount() < 3) {
            this.roomManager.player.addPetal();
        }        
        // Update pumpkin dialogue
        if (this.pumpkins.length > 0) {
            this.pumpkinDialogues = ["Thank you for defeating the skeletons! Here's a petal for your bravery."];
            this.pumpkin.dialogues = this.pumpkinDialogues;
            this.pumpkin.currentDialogueIndex = 0;
        }

        // remove this petal from the scene
        if (this.petal) {
            this.petal.visible = false;
        }
    }

    removeSkeletonFromScene(skeleton) {
        const index = this.skeletons.indexOf(skeleton);
        if (index > -1) {
            this.skeletons.splice(index, 1);
            skeleton.die();
        }
    }

    checkPlayerDamage(playerPosition) {
        let attackingSkeletons = this.skeletons.filter(skeleton =>
        skeleton.isAttacking &&
        skeleton.mesh.position.distanceTo(playerPosition) < 0.3 &&
        skeleton.currentState === 'attack');
        if (attackingSkeletons.length > 0) {
            this.roomManager.player.takeDamage();
            if (this.roomManager.player.hp <= 0) {
                this.triggerGameOver();
            }
        }
    }

    triggerGameOver() {
        showUIMessage('GAME OVER. \n beware of the undeads', true);
        if (typeof window.showGameOver === 'function') {
            window.showGameOver();
        }
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);

        this.pumpkins.forEach(pumpkin => {
            pumpkin.removeFromScene(scene);
            this.world.removeBody(pumpkin.body);
        });

        this.removeDecorativeObjects(scene);
        this.pumpkins = [];

        if (this.audioManager) {
            this.audioManager.stopAllSounds();
        }

        this.skeletons.forEach(skeleton => {
            skeleton.die();
        });
        this.skeletons = [];

        window.removeEventListener('character-shoot', this.handleCharacterShoot);
        window.removeEventListener('skeletonLoaded', this.handleSkeletonLoaded);

        console.log('Room 5 cleaned up');
    }
}