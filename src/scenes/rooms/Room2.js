import { RoomBase } from "../RoomBase.js";
import * as THREE from "three";
import { GLTFLoader } from "/node_modules/three/examples/jsm/loaders/GLTFLoader.js";
import { PumpkinNPC } from "../../characters/pumpkinNPC.js";
import { hideDialogueOptions, showDialogueOptions } from "../../utils/UI.js";
import * as CANNON from "cannon-es";
import { showUIMessage } from "../../utils/UI.js";

export class Room2 extends RoomBase {
    constructor(config, roomManager, audioManager) {
        super(config, roomManager);
        this.audioManager = audioManager;
        this.gltfLoader = new GLTFLoader();
        this.world = roomManager.world;
        this.textureLoader = new THREE.TextureLoader();
        this.pumpkins = [];
        this.audio = null;

        this.petal = null;
        this.boxes = null;
        this.stand = null;

        this.bpm = 78;
        this.doors = [
            { position: new THREE.Vector3(-1.5, -0.17, 0), rotation: new THREE.Euler(0, -Math.PI/2, 0), connection: 1 },
            { position: new THREE.Vector3(0, -0.17, 1.5), rotation: new THREE.Euler(0, 0, 0), connection: 4 }
        ];
        this.pumpkinDialogues = [
            "Welcome to Room 2... You're not lost, are you?",
            "May you check the next room for me?",
            "... I know there are two petals in there ...",
            "I can't go there, but you can help me, right?",
            "Good luck... eheheh"
        ];
        this.scene = roomManager.scene;
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

        // boxes
        this.gltfLoader.load("src/assets/models/set_of_cardboard_boxes.glb", (gltf) => {
            this.boxes = gltf.scene;
            this.boxes.scale.set(0.5, 0.5, 0.5);
            this.boxes.position.set(0.9, -0.5, 1.2);
            this.boxes.rotation.y = Math.PI;
            this.boxes.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.metalness = 0.5;
                    child.material.roughness = 0.5;
                }
            });
            scene.add(this.boxes);
            this.addDecorativeObject(this.boxes);
        });

        const boxesSize = [0.6, 0.3, 0.5];
        const boxesShape = new CANNON.Box(new CANNON.Vec3(boxesSize[0] / 2, boxesSize[1] / 2, boxesSize[2] / 2));
        const boxesBody = new CANNON.Body({
            mass: 0,
            shape: boxesShape,
            position: new CANNON.Vec3(0.9, -0.5, 1.2),
            collisionFilterGroup: 1,
            collisionFilterMask: 2
        });
        this.world.addBody(boxesBody);
        this.addDecorativeObject(boxesBody);

        // directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 0);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 512;
        directionalLight.shadow.mapSize.height = 512;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        scene.add(directionalLight);
        scene.add(directionalLight.target);
        this.addDecorativeObject(directionalLight);
        this.addDecorativeObject(directionalLight.target);        

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

        //light white
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

        // pumpkin NPC
        const pumpkin16Path = "src/assets/textures/carved_pumpkin/16.png";
        const pumpkin16TalkPath = "src/assets/textures/carved_pumpkin/16.png";
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


        // over door 4 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number4.glb", (gltf) => {
            const number4 = gltf.scene;
            number4.scale.set(0.01, 0.01, 0.01);
            number4.position.set(-0.025, 0.1, 1.5);
            number4.rotation.y = Math.PI;
            scene.add(number4);
            this.addDecorativeObject(number4);
        });

        // over door 1 number
        this.gltfLoader.load("src/assets/models/digital_numbers/number1.glb", (gltf) => {
            const number1 = gltf.scene;
            number1.scale.set(0.01, 0.01, 0.01);
            number1.position.set(-1.5, 0.1, 0);
            number1.rotation.y = Math.PI/2;
            scene.add(number1);
            this.addDecorativeObject(number1);
        });
    }

    handleDialogueChange(dialogueOptions) {
        if (dialogueOptions) {
            showDialogueOptions(dialogueOptions);
        } else {
            hideDialogueOptions();
        }
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
        if (this.petal && playerPosition.distanceTo(this.petal.position) < 0.3) {
            showUIMessage("Press E to pick up the petal");
            if (this.input.keys['e']) {
                this.pickupPetal(playerPosition);
            }
        }
        this.roomManager.checkPumpkinInteraction(playerPosition, this.pumpkinDialogues);
    }

    pickupPetal(playerPosition) {
        if (this.petal && this.scene) {
            this.scene.remove(this.petal);
            this.petal = null;
            this.roomManager.player.addPetal();
            showUIMessage("You picked up the petal!");
            console.log("Picked up PETAL");
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

        console.log('Room 2 cleaned up');
    }
}