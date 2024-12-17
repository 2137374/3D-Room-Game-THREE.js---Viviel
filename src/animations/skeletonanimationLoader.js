/**
 * @license
 * VivielGame
 * Copyright (c) 2024 [Leonardo Sandri]. All Rights Reserved.
 * Proprietary and Confidential - See LICENSE file for details
 */

import * as THREE from 'three';

export class SkeletonAnimationLoader {
    constructor() {
        this.animations = {};
    }

    async loadAnimation(animationName, poseNames) {
        this.animations[animationName] = [];
        for (let poseName of poseNames) {
            try {
                const response = await fetch(`/src/poses/skeleton/${poseName}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const poseData = await response.json();
                this.animations[animationName].push(poseData);
            } catch (error) {
                console.error(`Error loading pose ${poseName} for animation ${animationName}:`, error);
            }
        }

        if (this.animations[animationName].length > 0) {
            this.animations[animationName].push(this.animations[animationName][0]);
            console.log(`Loaded ${this.animations[animationName].length} poses for ${animationName}`);
        } else {
            console.error(`No poses loaded for ${animationName}`);
        }
    }

    getInterpolatedPose(animationName, progress) {
        const poses = this.animations[animationName];
        if (!poses || poses.length < 2) return null;

        const totalPoses = poses.length;
        const poseDuration = 1 / (totalPoses - 1);
        
        const currentPoseIndex = Math.floor(progress / poseDuration);
        const interpolationFactor = (progress % poseDuration) / poseDuration;

        const currentPose = poses[currentPoseIndex];
        const nextPose = poses[(currentPoseIndex + 1) % totalPoses];

        const interpolatedPose = {};
        for (const boneName in currentPose) {
            interpolatedPose[boneName] = {
                x: THREE.MathUtils.lerp(currentPose[boneName].x, nextPose[boneName].x, interpolationFactor),
                y: THREE.MathUtils.lerp(currentPose[boneName].y, nextPose[boneName].y, interpolationFactor),
                z: THREE.MathUtils.lerp(currentPose[boneName].z, nextPose[boneName].z, interpolationFactor)
            };
        }

        return interpolatedPose;
    }
}