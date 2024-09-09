import * as THREE from 'three';

export class ShootAnimationSystem {
    constructor(skinnedMesh) {
        this.skinnedMesh = skinnedMesh;
        this.skeleton = skinnedMesh.skeleton;
        this.shootPoses = {
            start: null,
            recoil: null
        };
        this.isAnimating = false;
        this.animationProgress = 0;
        this.animationDuration = 0.2;
        this.soundDuration = 0.5;

        this.loadShootPoses();
    }

    async loadShootPoses() {
        try { 
            const recoilPoseResponse = await fetch('/src/poses/shot.json');

            this.shootPoses.recoil = await recoilPoseResponse.json();
        } catch (error) {
            console.error('Error loading shoot poses:', error);
        }
    }

    startShootAnimation() {
        if (this.isAnimating) return false;
        this.isAnimating = true;
        this.animationProgress = 0;

        this.shootPoses.start = this.captureCurrentPose();

        return true;
    }

    captureCurrentPose() {
        const currentPose = {};
        this.skeleton.bones.forEach(bone => {
            currentPose[bone.name] = {
                x: bone.rotation.x,
                y: bone.rotation.y,
                z: bone.rotation.z
            };
        });
        return currentPose;
    }

    update(deltaTime) {
        if (!this.isAnimating) return;

        this.animationProgress += deltaTime / this.animationDuration;

        if (this.animationProgress <= 1) {
            const interpolatedPose = this.getInterpolatedPose(this.animationProgress);
            this.applyPose(interpolatedPose);
        } else if (this.animationProgress <= 2) {
            const reverseProgress = 2 - this.animationProgress;
            const interpolatedPose = this.getInterpolatedPose(reverseProgress);
            this.applyPose(interpolatedPose);
        } else {
            this.isAnimating = false;
        }
    }

    getInterpolatedPose(progress) {
        const interpolatedPose = {};
        for (const boneName in this.shootPoses.start) {
            interpolatedPose[boneName] = {
                x: THREE.MathUtils.lerp(this.shootPoses.start[boneName].x, this.shootPoses.recoil[boneName].x, progress),
                y: THREE.MathUtils.lerp(this.shootPoses.start[boneName].y, this.shootPoses.recoil[boneName].y, progress),
                z: THREE.MathUtils.lerp(this.shootPoses.start[boneName].z, this.shootPoses.recoil[boneName].z, progress)
            };
        }
        return interpolatedPose;
    }

    applyPose(pose) {
        for (const [boneName, rotation] of Object.entries(pose)) {
            const bone = this.skeleton.getBoneByName(boneName);
            if (bone) {
                bone.rotation.set(rotation.x, rotation.y, rotation.z);
            }
        }
        this.skeleton.update();
    }

    canShoot() {
        return !this.isAnimating;
    }
}