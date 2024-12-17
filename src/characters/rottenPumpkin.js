/**
 * @license
 * VivielGame
 * Copyright (c) 2024 [Leonardo Sandri]. All Rights Reserved.
 * Proprietary and Confidential - See LICENSE file for details
 */

import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class RottenPumpkin {
    constructor(scene, position, world, texture, speed = 0.35) {
        this.scene = scene;
        this.position = position;
        this.world = world;
        this.normalTexture = new THREE.TextureLoader().load(texture);
        this.speed = speed;
        this.baseTexture = new THREE.TextureLoader().load("src/assets/textures/Pumpkin.png");

        // head
        const headGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const headMaterials = [
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture }),
            new THREE.MeshPhongMaterial({ map: this.normalTexture }),
            new THREE.MeshPhongMaterial({ map: this.baseTexture })
        ];
        this.head = new THREE.Mesh(headGeometry, headMaterials);
        this.head.position.y = -0.1;
        this.head.castShadow = true;
        this.head.receiveShadow = true;

        this.scene.add(this.head);
        this.createPhysics();
    }

    checkPlayerProximity(playerPosition) {
        if ( this.head.position.distanceTo(playerPosition) < 0.3) 
        return true;
   }

    setTexture(texture) {
        this.head.material[4].map = texture;
        this.head.material[4].needsUpdate = true;
    }

    update(deltaTime, playerPosition, flowerPosition) {
        if (flowerPosition) {
            this.target = flowerPosition;
        } else {
            this.target = playerPosition;
        }

        if (this.target) {
            const direction = new THREE.Vector3().subVectors(this.target, this.head.position).normalize();
            const movement = direction.multiplyScalar(this.speed * deltaTime);
            this.head.position.add(movement);
            this.body.position.copy(this.head.position);
            this.head.rotation.y = Math.atan2(direction.x, direction.z);
        }

        if (!flowerPosition && this.checkPlayerProximity(playerPosition)) {
            return true;
        }

        return false;
    }

    createPhysics() {
        const shape = new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1));
        this.body = new CANNON.Body({
            mass: 1,
            shape: shape
        });
        this.body.position.copy(this.head.position);
        this.world.addBody(this.body);
    }

    removeFromScene() {
        this.scene.remove(this.head);
        this.world.removeBody(this.body);
    }
}
