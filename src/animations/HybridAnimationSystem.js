import * as THREE from 'three';
import { CCDIKSolver } from '/node_modules/three/examples/jsm/Addons.js';
import { WalkCycleLoader } from '/src/animations/walkCycleLoader.js';

export class HybridAnimationSystem {
    constructor(skinnedMesh) {
        this.skinnedMesh = skinnedMesh;
        this.skeleton = skinnedMesh.skeleton;
        this.walkCycleLoader = new WalkCycleLoader();
        this.walkProgress = 0;
        this.currentFrame = 0;
        this.walkSpeed = 1;
        this.transitionDuration = 0.3;
        this.currentState = 'idle';

        this.setupIKChain();
        this.loadWalkCycle();
    }

    async loadWalkCycle() {
        await this.walkCycleLoader.loadSteps();
    }
    
    setupIKChain() {
        const bones = this.skeleton.bones;
        const findBoneIndex = (name) => bones.findIndex(bone => bone.name === name);
        
        const iks = [
            {
                target: findBoneIndex('CC_Base_L_Foot'),
                effector: findBoneIndex('CC_Base_L_Foot'),
                links: [
                    { index: findBoneIndex('CC_Base_L_Calf') },
                    { index: findBoneIndex('CC_Base_L_Thigh') },
                    { index: findBoneIndex('CC_Base_Hip') }
                ],
                iterations: 10,
                minAngle: 0.0,
                maxAngle: 1.0
            },
            {
                target: findBoneIndex('CC_Base_R_Foot'),
                effector: findBoneIndex('CC_Base_R_Foot'),
                links: [
                    { index: findBoneIndex('CC_Base_R_Calf') },
                    { index: findBoneIndex('CC_Base_R_Thigh') },
                    { index: findBoneIndex('CC_Base_Hip') }
                ],
                iterations: 10,
                minAngle: 0.0,
                maxAngle: 1.0
            }
        ];

        this.ikSolver = new CCDIKSolver(this.skinnedMesh, iks);
    }

    update(deltaTime, isMovingForward, isMovingBackward, isWalking) {
        if (isWalking) {
            if (isMovingForward) {
                this.walkProgress += deltaTime * this.walkSpeed;
                if (this.walkProgress > 1) this.walkProgress %= 1;
            } else if (isMovingBackward) {
                this.walkProgress -= deltaTime * this.walkSpeed;
                if (this.walkProgress < 0) this.walkProgress = 1 + (this.walkProgress % 1);
            } else if (isWalking && !isMovingForward && !isMovingBackward) {
                this.walkProgress += deltaTime * this.walkSpeed;
                if (this.walkProgress > 1) this.walkProgress %= 1;
            }

            let walkPose = this.walkCycleLoader.getInterpolatedPose(this.walkProgress);
            this.applyPose(walkPose);
        }

        if (this.needsIKUpdate) { 
            this.updateIKTargets();
            this.ikSolver.update();
            this.needsIKUpdate = false;
            console.log("updating IK");
        }

        this.skeleton.update();
    }

    setNeedsIKUpdate() {
        this.needsIKUpdate = true;
    }

    updateIKTargets() {
        if (!this.ikSolver || !this.ikSolver.iks || !this.ikSolver.iks.length < 2) {
            console.warn('IK solver not initialized');
            return;
        }

        const floorHeight = -0.4651030095660836;
        const leftFoot = this.skeleton.getBoneByName('CC_Base_L_Foot');
        const rightFoot = this.skeleton.getBoneByName('CC_Base_R_Foot');

        if (leftFoot) {
            leftFoot.getWorldPosition(this.ikSolver.chains[0].target);
            this.ikSolver.chains[0].target.y = floorHeight;
        }

        if (rightFoot) {
            rightFoot.getWorldPosition(this.ikSolver.chains[1].target);
            this.ikSolver.chains[1].target.y = floorHeight;
        }
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

    transitionTo(newState, deltaTime) {
        if (newState == this.currentState) return;
        this.currentState = newState;
    }
}