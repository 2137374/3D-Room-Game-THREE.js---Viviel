/**
 * @license
 * VivielGame
 * Copyright (c) 2024 [Leonardo Sandri]. All Rights Reserved.
 * Proprietary and Confidential - See LICENSE file for details
 */

import * as THREE from 'three';
import { SkeletonAnimationLoader } from '/src/animations/skeletonanimationLoader.js';

export class SkeletonAnimationSystem {
    constructor(skeletonMesh) {
        this.skeletonMesh = skeletonMesh;
        this.skeleton = skeletonMesh.skeleton;
        this.animationLoader = new SkeletonAnimationLoader();
        this.currentAnimation = 'skeletonWalk';
        this.animationProgress = 0;
        this.animationSpeed = 1;

        if (!this.skeleton) {
            console.error('Skeleton non trovato nello SkinnedMesh fornito');
        }    
    }

    async loadAnimations() {
        await this.animationLoader.loadAnimation('skeletonWalk', ['skeletonWalk2', 'skeletonWalk3']);
        await this.animationLoader.loadAnimation('attack', ['attack1', 'attack2']);
    }

    update(deltaTime) {
        this.animationProgress += deltaTime * this.animationSpeed;
        if (this.animationProgress > 1) this.animationProgress %= 1;

        const pose = this.animationLoader.getInterpolatedPose(this.currentAnimation, this.animationProgress);
        if (pose) {
            this.applyPose(pose);
        }
        this.skeleton.update();
    }

    applyPose(pose) {
        for (const [boneName, rotation] of Object.entries(pose)) {
            const bone = this.skeleton.getBoneByName(boneName);
            if (bone) {
                bone.rotation.set(rotation.x, rotation.y, rotation.z);
            }
        }
    }

    setAnimation(animationName) {
        if (this.animationLoader.animations[animationName]) {
            this.currentAnimation = animationName;
            this.animationProgress = 0;
        } else {
            console.warn(`Animation ${animationName} not loaded`);
        }
    }

    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
}