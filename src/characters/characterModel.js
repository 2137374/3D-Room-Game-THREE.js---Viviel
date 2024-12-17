/**
 * @license
 * VivielGame
 * Copyright (c) 2024 [Leonardo Sandri]. All Rights Reserved.
 * Proprietary and Confidential - See LICENSE file for details
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { world } from '/src/scenes/physicsSetup.js';
import { input } from '../controllers/Input.js';
import { CharacterMovement } from '../controllers/characterMovement.js';
import { HybridAnimationSystem } from '../animations/HybridAnimationSystem.js';
import { PoseControlSystem } from '../animations/pose-control-system.js';
import { ShootAnimationSystem } from '../animations/ShootAnimationSystem.js';
import { AudioManager } from '../utils/audioManager.js';
import { updatePetalCountUI } from '../utils/UI.js';

export class CharacterModel {
    constructor (scene, world, camera, initialPosition) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;

        this.mesh = null;
        this.body = null;
        this.initialPosition = initialPosition;
        this.skinnedMesh = null;
        this.rotationSK = null;

        this.ik = null;
        this.animationManager = null;
        
        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
        
        this.movement = null;

        this.gun = null;
        this.lastShootingTime = 0;
        this.shootCooldown = 500;
        this.audioManager = new AudioManager(this.camera);
        this.audioManager.loadSound('shoot', 'src/assets/audio/Revolver shoot - Sound effect (HD).mp3');

        this.isAiming = false;
        this.isShooting = false;
        this.cameraAngles = {
            x : 0,
            y : 0,
            z : 0
        };
        this.camera.defaultFOV = camera.fov;
        
        this.HybridAnimationSystem = null;
        this.PoseControlSystem = null;
        
        this.shootAnimationSystem = null;
        this.hp = 100;

        this.isHoldingFlower = false;

        this.petalCount = 0;
        this.hasAllPetals = false;

        this.loadModel();
    }
    
    loadModel() {
        const loader = new GLTFLoader();

        loader.load('src/assets/models/character/character2.glb', async (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.1, 0.1, 0.1);
            this.mesh.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const textureLoader = new THREE.TextureLoader();
                    const materials = {
                        aoMap: textureLoader.load('src/assets/models/character/Ambient Occlusion Map from Mesh aiStandardSurface1.png'),
                        map : textureLoader.load('src/assets/models/character/mesh_uv_aiStandardSurface1_BaseColor.png'),
                        emissiveMap : textureLoader.load('src/assets/models/character/mesh_uv_aiStandardSurface1_Emissive.png'),
                        metalnessMap : textureLoader.load('src/assets/models/character/mesh_uv_aiStandardSurface1_Metallic.png'),
                        roughnessMap : textureLoader.load('src/assets/models/character/mesh_uv_aiStandardSurface1_Roughness.png')
                    };

                    child.material = new THREE.MeshStandardMaterial({
                        map: materials.map,
                        aoMap: materials.aoMap,
                        emissiveMap: materials.emissiveMap,
                        metalnessMap: materials.metalnessMap,
                        roughnessMap: materials.roughnessMap,
                        metalness: 1,
                        roughness: 1,
                    });
                }

                if (child.isSkinnedMesh) { 
                    this.skinnedMesh = child;
                    this.skinnedMesh.castShadow = true;
                    this.skinnedMesh.receiveShadow = true;
                }
            });

            this.gunReference = new THREE.Object3D();
            this.gunReference.name = 'GunReference';
            this.mesh.add(this.gunReference);

            const rightHand = gltf.scene.getObjectByName('CC_Base_R_Hand');
            if (rightHand) {
                const handWorldPosition = new THREE.Vector3();
                rightHand.getWorldPosition(handWorldPosition);

                const handLocalPosition = this.mesh.worldToLocal(handWorldPosition);
                this.gunReference.position.copy(handLocalPosition);

                this.gunReference.position.add(new THREE.Vector3(0.15, 0.4, 0));

                this.gunReference.rotation.set(
                    0,
                    0,
                    0
                );
            }

            this.initialPosition = new THREE.Vector3(1, -0.47, -1);

            this.mesh.position.copy(this.initialPosition);
            this.scene.add(this.mesh);

            this.createPhysicalBody();
            this.mesh.quaternion.copy(this.body.quaternion);

            // character movement handler
            this.movement = new CharacterMovement(this.mesh, this.body, this.camera, this.scene, this.world);

            // base pose and animations
            this.setupHybridAnimation();
            this.setupPoseControlSystem();
            this.setupShootAnimationSystem();
        });
    }

    setupShootAnimationSystem() {
        if (this.skinnedMesh) {
            this.shootAnimationSystem = new ShootAnimationSystem(this.skinnedMesh);
        } else { 
            console.error("Skinned mesh not found");
        }
    }

    setupHybridAnimation() {
        this.HybridAnimationSystem = new HybridAnimationSystem(this.skinnedMesh);
    }

    setupPoseControlSystem() {
        if (this.skinnedMesh) {
            this.PoseControlSystem = new PoseControlSystem(this.skinnedMesh);
            this.PoseControlSystem.loadBasePose();
        } else {
            console.error("Skinned mesh not found");
        }
    }

    getPosition() {
        if (this.mesh && this.mesh.position) {
            return this.mesh.position.clone();
        }
        return null;
    }

    createPhysicalBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.03, 0.005, 0.03));
        this.body = new CANNON.Body({
            mass: 5,
            position: new CANNON.Vec3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z),
            shape: shape,
            fixedRotation: true,
            linearDamping: 0.5,
            material: new CANNON.Material({ friction: 0.6}),
            collisionFilterGroup: 2,
            collisionFilterMask: 1 | 4
        });

        this.body.quaternion.setFromEuler(0, -Math.PI/2, 0);
        world.addBody(this.body);  
    }

    update(deltaTime) {
        if (this.mesh && this.body) {
            let hasMoved = false;
            if (this.movement) {
                hasMoved = this.movement.update(deltaTime);
            }

            if (this.mesh.position && this.body.position) {
                this.mesh.position.copy(this.body.position);
                this.mesh.quaternion.copy(this.body.quaternion);
            }

            if (this.HybridAnimationSystem) {
                const isMovingForward = this.movement.getIsMovingForward();
                const isMovingBackward = this.movement.getIsMovingBackward();
                const isWalking = this.movement ? this.movement.getIsWalking() : false;
                this.HybridAnimationSystem.update(deltaTime, isMovingForward, isMovingBackward, isWalking);
                if (hasMoved) {
                    this.HybridAnimationSystem.setNeedsIKUpdate();
                }
            }

            if (this.movement && this.HybridAnimationSystem) {
                const isWalking = this.movement.getIsWalking();
                if (isWalking) {
                    this.HybridAnimationSystem.update(deltaTime);
                }
            }

            if (this.shootAnimationSystem) {
                this.shootAnimationSystem.update(deltaTime);
            }

            this.handleShooting();
            this.handleAiming();
        }
    }

    handleShooting() {
        const curretTime = performance.now();
        if (input.isMouseDownLeft && 
            this.shootAnimationSystem && 
            this.shootAnimationSystem.canShoot() &&
            curretTime - this.lastShootingTime > this.shootCooldown) {

            console.log('conditions for shooting met');
            if (this.shootAnimationSystem.startShootAnimation()) {
                console.log('startShootAnimation called');
                this.shoot();
                this.lastShootingTime = curretTime;
            }
        }
    }

    handleAiming() {
        if (input.isRightMouseDown) {
            if (!this.isAiming) {
                this.isAiming = true;
                this.camera.fov = this.camera.defaultFOV / 1.5;
                this.camera.updateProjectionMatrix();
            }
        } else {
            if (this.isAiming) {
                this.isAiming = false;
                this.camera.fov = this.camera.defaultFOV;
                this.camera.updateProjectionMatrix();
            }
        }
    }

    shoot() {
        if (this.audioManager.getAudioContext().state !== 'running') {
            console.warn('Audio context not running user interaction required');
            return;
        }
        this.audioManager.playSound('shoot');
        const raycaster = new THREE.Raycaster();
        const gunPosition = new THREE.Vector3();
        const gunDirection = new THREE.Vector3();

        this.camera.getWorldPosition(gunPosition);
        const verticalOffset = new THREE.Vector3(0, -0.1, 0);
        gunPosition.add(verticalOffset);

        this.camera.getWorldDirection(gunDirection);

        raycaster.set(gunPosition, gunDirection);
        
        const shootEvent = new CustomEvent('character-shoot', { 
            detail: { raycaster: raycaster, position: gunPosition, direction: gunDirection, currentRoomId: this.currentRoomId }
        });
        window.dispatchEvent(shootEvent);
    }

    savePose(name) {
        if (this.PoseControlSystem) {
            const poseData = this.PoseControlSystem.savePose();
            localStorage.setItem(`pose_${name}`, poseData);
            console.log(`Pose '${name}' saved successfully!`);
            return poseData;
        } else {
            console.error("PoseControlSystem not initialized");
        }
    }

    setCurrentRoomId(roomId) {
        this.currentRoomId = roomId;
        console.log(`Character current room set to: ${roomId}`);
    }

    addPetal() {
        if (this.petalCount < 3) {
            this.petalCount++;
            if (this.petalCount === 3) {
                this.hasAllPetals = true;
            }
            updatePetalCountUI(this.petalCount);
        }
    }

    getPetalCount() {
        return this.petalCount;
    }

    hasAllPetalsCollected() {
        return this.hasAllPetals;
    }

    takeDamage() {
        this.hp--;
    }
}