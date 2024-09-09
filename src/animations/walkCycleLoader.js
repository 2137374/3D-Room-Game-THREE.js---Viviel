import * as THREE from 'three';

export class WalkCycleLoader {
    constructor() {
        this.steps = [];
        this.currentStepIndex = 0;
        this.interpolationFactor = 0;
    }

    async loadSteps() {
        const stepOrder = ['base Pose', 'walk1', 'walk2', 'walk3', 'walk4', 'walk5'];
        for (let stepName of stepOrder) {
            try {
                const response = await fetch(`/src/poses/${stepName}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const stepData = await response.json();
                this.steps.push(stepData);
            } catch (error) {
                console.error(`Error loading pose ${stepName}:`, error);
            }
        }

        if (this.steps.length > 0) {
            this.steps.push(this.steps[0]);
            console.log(`Loaded ${this.steps.length} poses`);
        } else {
            console.error("No poses loaded");
        }
    }

    getInterpolatedPose(progress) {
        const totalSteps = this.steps.length;
        const stepDuration = 1 / (totalSteps - 1);
        
        this.currentStepIndex = Math.floor(progress / stepDuration);
        this.interpolationFactor = (progress % stepDuration) / stepDuration;

        const currentStep = this.steps[this.currentStepIndex];
        const nextStep = this.steps[(this.currentStepIndex + 1) % totalSteps];

        const interpolatedPose = {};
        for (const boneName in currentStep) {
            interpolatedPose[boneName] = {
                x: THREE.MathUtils.lerp(currentStep[boneName].x, nextStep[boneName].x, this.interpolationFactor),
                y: THREE.MathUtils.lerp(currentStep[boneName].y, nextStep[boneName].y, this.interpolationFactor),
                z: THREE.MathUtils.lerp(currentStep[boneName].z, nextStep[boneName].z, this.interpolationFactor)
            };
        }

        return interpolatedPose;
    }
}