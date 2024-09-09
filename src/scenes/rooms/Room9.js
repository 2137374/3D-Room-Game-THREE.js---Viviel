import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { PumpkinNPC } from "../../characters/pumpkinNPC.js";
import { showDialogueOptions, hideDialogueOptions } from "../../utils/UI.js";
import * as CANNON from "cannon-es";

export class Room9 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.pumpkins = [];
        this.audio = null;
        this.bpm = 78;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, Math.PI/2, 0), connection: 4 },
            { position: new THREE.Vector3(0, -0.17, 1.5), rotation: new THREE.Euler(0, Math.PI, 0), connection: 8 }
        ];
        this.pumpkinDialogues = [
            "Beware next door! There is a rotten pumpkin",
            "If you find the yellow flowers, you can go beyond, but be careful",
            "rotten pumpkins are dangerous",
            "they can calm down only with flowers",
            "We all pumpkins like flowers, but they...",
            "... they are obsessed with them"
        ];
        this.lastPress = 501;
        this.isNearPumpkin = false;        
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

        // pumpkins
        this.gltfLoader.load("src/assets/models/pumpkins_model..glb", (gltf) => {
            this.ppks = gltf.scene;
            this.ppks.scale.set(0.04, 0.04, 0.04);
            this.ppks.position.set(0, -0.5, 0);
            this.ppks.rotation.y = Math.PI;
            this.ppks.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            scene.add(this.ppks);
            this.addDecorativeObject(this.ppks);
        });

        const ppksBodySize = new CANNON.Vec3(0.2, 0.2, 0.2);
        const ppksBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, -0.5, 0),
            shape: new CANNON.Box(ppksBodySize)
        });
        world.addBody(ppksBody);
        this.addDecorativeObject(ppksBody);

        //light white
        const light = new THREE.SpotLight(0xffffff, 50, 10, Math.PI / 4, 0.5, 2);
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

        // pumpkin NPC
        const pumpkin16Path = "src/assets/textures/carved_pumpkin/23.png";
        const pumpkin16TalkPath = "src/assets/textures/carved_pumpkin/23.png";
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
        this.pumpkin.onDialogueChange = this.handleDialogueChange.bind(this);
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

        // over door 8 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number8.glb", (gltf) => {
            const number8 = gltf.scene;
            number8.scale.set(0.01, 0.01, 0.01);
            number8.position.set(0, 0.1, 1.5);
            number8.rotation.y = 2*Math.PI;
            scene.add(number8);
            this.addDecorativeObject(number8);
        });

        // over door 4 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number4.glb", (gltf) => {
            const number4 = gltf.scene;
            number4.scale.set(0.01, 0.01, 0.01);
            number4.position.set(-1.5, 0.1, 0);
            number4.rotation.y = Math.PI/2;
            scene.add(number4);
            this.addDecorativeObject(number4);
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
        if (this.audioManager && this.audioManager.sounds['background'] && this.audioManager.sounds['background'].isPlaying) {
            const time = this.audioManager.getAudioContext().currentTime;
            const beat = (time * this.bpm / 60) % 1;
    
            this.pumpkins.forEach(pumpkin => {
                pumpkin.update(deltaTime, beat);
            });
        }
        this.roomManager.checkPumpkinInteraction(playerPosition, this.pumpkinDialogues);
    }

    removeFromScene(scene) {
        super.removeFromScene(scene);

        this.pumpkins.forEach(pumpkin => {
            pumpkin.removeFromScene(scene);
            this.world.removeBody(pumpkin.body);
        });

        this.pumpkins = [];

        console.log('Room 9 cleaned up');
    }
}