import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PumpkinNPC {
    constructor(scene, position, world, texture, talkingTexture, scaleValue, rotationValue, dialogues, gameState) {
        this.scene = scene;
        this.position = position;
        this.group = new THREE.Group();
        this.world = world;
        this.dialogues = dialogues;
        this.currentDialogueIndex = 0;
        this.isDialogueActive = false;
        this.normalTexture = new THREE.TextureLoader().load(texture);
        this.talkingTexture = new THREE.TextureLoader().load(talkingTexture);
        this.baseTexture = new THREE.TextureLoader().load("src/assets/textures/Pumpkin.png");
        this.isTalking = false;
        this.textureChangeInterval = null;
        this.gameState = gameState;
        this.onDialogueChange = null;

        // box
        const baseGeometry = new THREE.BoxGeometry(0.55, 0.55, 0.55);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);

        // neck
        this.springGroup = new THREE.Group();
        this.spring = this.createSpring();
        this.spring.castShadow = true;
        this.spring.receiveShadow = true;
        this.springGroup.add(this.spring);
        this.springGroup.position.y = 0.275

        // head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMaterials = [
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.normalTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture })
        ];
        this.head = new THREE.Mesh(headGeometry, headMaterials);
        this.head.position.y = 0.9;
        this.head.castShadow = true;
        this.head.receiveShadow = true;

        this.springGroup.add(this.head);

        this.group.add(this.base);
        this.group.add(this.springGroup);

        this.group.position.copy(position);
        this.group.scale.set(scaleValue, scaleValue, scaleValue);
        this.group.rotation.y = rotationValue;

        this.scene.add(this.group);

        this.maxAngle = Math.PI / 8;

        this.createPhysics();
    }

    setDialogue(newDialogue) {
        this.dialogues = [newDialogue];
        this.currentDialogueIndex = 0;
    }

    createSpring() {
        const turns = 8;
        const height = 0.7;
        const points = [];
        for (let i = 0; i <= turns * 16; i++) {
            const t = i / (turns * 16);
            const angle = 2 * Math.PI * turns * t;
            const x = 0.05 * Math.cos(angle);
            const y = height * t;
            const z = 0.05 * Math.sin(angle);
            points.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(points);

        const tubularSegments = turns * 32;
        const radius = 0.015;
        const radialSegments = 8;
        const closed = false;

        const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513
        });

        return new THREE.Mesh(geometry, material);
    }

    checkPlayerProximity(playerPosition) {
        if ( this.group.position.distanceTo(playerPosition) < 0.3) 
        return true;
   }

    getDialogueOptions() {
        return this.dialogues[this.currentDialogueIndex];
    }

    progressDialogue() {
        if (this.isDialogueActive) {
            this.currentDialogueIndex = (this.currentDialogueIndex + 1) % this.dialogues.length;
            console.log(`Progressing dialogue to index: ${this.currentDialogueIndex}`);
            if (this.onDialogueChange) {
                this.onDialogueChange(this.getDialogueOptions());
            }
        }
    }

    startTalking() {
        this.isDialogueActive = true;
        this.isTalking = true;
        this.currentDialogueIndex = 0;  // Reset to the first dialogue when starting
        console.log("Starting dialogue from the beginning");
        this.textureChangeInterval = setInterval(() => {
            this.toggleTexture();
        }, 1000);
        if (this.onDialogueChange) {
            this.onDialogueChange(this.getDialogueOptions());
        }
    }

    stopTalking() {
        this.isDialogueActive = false;
        this.isTalking = false;
        this.currentDialogueIndex = 0;
        clearInterval(this.textureChangeInterval);
        this.setTexture(this.normalTexture);
        if (this.onDialogueChange) {
            this.onDialogueChange(null);
        }
    }

    toggleTexture() {
        if (this.head.material[4].map === this.normalTexture) {
            this.setTexture(this.talkingTexture);
        } else {
            this.setTexture(this.normalTexture);
        }
    }

    setTexture(texture) {
        this.head.material[4].map = texture;
        this.head.material[4].needsUpdate = true;
    }

    update(deltaTime, beat) {
        const angle = Math.sin(beat * Math.PI * 2) * this.maxAngle;

        this.springGroup.rotation.z = angle;

        const springStretch = 1 + Math.abs(Math.sin(this.angle) * 0.1);
        this.spring.scale.y = (1, springStretch, 1);
    }

    createPhysics() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1));
        this.body = new CANNON.Body({
            mass: 0,
            shape: shape
        });
        this.body.position.copy(this.group.position);
        this.world.addBody(this.body);
    }

    removeFromScene() {
        this.scene.remove(this.group);
        this.world.removeBody(this.body);
    }
}
