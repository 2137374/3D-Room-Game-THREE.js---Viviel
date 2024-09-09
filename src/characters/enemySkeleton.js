import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';
import { SkeletonAnimationSystem } from '/src/animations/skeletonAnimationSystem.js';

export class EnemySkeleton {
    constructor(scene, world, position) {
        this.scene = scene;
        this.world = world;
        this.position = position;
        this.mesh = null;
        this.body = null;
        this.hp = 20;
        this.isAttacking = false;
        this.attackCooldown = 2000; // 2 seconds
        this.lastAttackTime = 0;
        this.speed = 0.2;
        this.animationSystem = null;
        this.currentState = 'idle';
        this.isLoaded = false;
        this.loadModel();
        this.hitBoxRadius = 0.25;
        this.hitBox = new THREE.Sphere(this.position, this.hitBoxRadius);

        // this.debugHitBox = new THREE.Mesh(
        //     new THREE.SphereGeometry(this.hitBoxRadius, 32, 32),
        //     new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true, transparent: true, opacity: 0.5 })
        // );
        // this.debugHitBox.position.copy(this.position);
        // scene.add(this.debugHitBox);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('src/assets/models/skeleton_character_psx/scene.gltf', (gltf) => {
            this.mesh = gltf.scene;
            this.mesh.scale.set(0.15, 0.15, 0.15);
            this.mesh.position.copy(this.position);
            this.scene.add(this.mesh);
            this.mesh.traverse((child) => {
                if (child.isSkinnedMesh) {
                    this.skinnedMesh = child;
                    // shadow
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.createPhysicalBody();
            this.setupAnimationSystem();
            this.isLoaded = true;
        });
    }

    setupAnimationSystem() {
        if (this.skinnedMesh) {
            this.animationSystem = new SkeletonAnimationSystem(this.skinnedMesh);
            this.animationSystem.loadAnimations().then(() => {
                this.animationSystem.setAnimation('skeletonWalk');
            });
        } else {
            console.error('Impossibile impostare il sistema di animazione: SkinnedMesh non trovato');
        }
    }

    createPhysicalBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.05, 0.005, 0.05));
        this.body = new CANNON.Body({
            mass: 1,
            shape: shape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            collisionFilterGroup: 2,
            collisionFilterMask: 1
        });
        this.world.addBody(this.body);
    }

    update(deltaTime, playerPosition) {
        if (!this.isLoaded || !this.mesh || !this.body || !this.animationSystem) return;

        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.mesh.position)
            .normalize();

        this.body.position.x += direction.x * this.speed * deltaTime;
        this.body.position.z += direction.z * this.speed * deltaTime;
        
        this.mesh.position.copy(this.body.position);

        const angle = Math.atan2(direction.x, direction.z);
        const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

        this.mesh.quaternion.slerp(targetQuaternion, 0.1);
        this.body.quaternion.copy(this.mesh.quaternion);

        this.animationSystem.update(deltaTime);

        this.hitBox.center.copy(this.mesh.position);
        if (this.debugHitBox) {
            this.debugHitBox.position.copy(this.mesh.position);
        }

        // Check if close enough to attack
        if (this.mesh.position.distanceTo(playerPosition) < 0.3) {
            this.attack();
        } else if (this.currentState !== 'walk') {
            this.currentState = 'walk';
            this.animationSystem.setAnimation('skeletonWalk');
        }
    }

    attack() {
        const currentTime = performance.now();
        if (currentTime - this.lastAttackTime > this.attackCooldown && !this.isAttacking) {
            this.isAttacking = true;
            this.lastAttackTime = currentTime;
            this.currentState = 'attack';
            this.animationSystem.setAnimation('attack', () => {
                this.isAttacking = false;
                this.currentState = 'walk';
                this.animationSystem.setAnimation('skeletonWalk');
            });
            return true;
        }
        return false;
    }
    
    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.scene.remove(this.mesh);
        this.world.removeBody(this.body);
    }
}