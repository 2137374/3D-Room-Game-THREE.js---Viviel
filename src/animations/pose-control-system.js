import * as THREE from 'three';
import { GUI } from 'dat.gui';

export class PoseControlSystem {
    constructor(skinnedMesh) {
        this.skinnedMesh = skinnedMesh;
        this.skeleton = skinnedMesh.skeleton;
        // this.gui = new GUI();
        // this.setupGUI();
    }

    // setupGUI() {
    //     const bones = this.skeleton.bones;
    //     const folders = {};

    //     bones.forEach(bone => {
    //         if (!bone.parent) return;

    //         const parts = bone.name.split('_');
    //         const folderName = parts.slice(0, -1).join('_');

    //         if (!folders[folderName]) {
    //             folders[folderName] = this.gui.addFolder(folderName);
    //         }

    //         const folder = folders[folderName];
    //         const boneFolder = folder.addFolder(bone.name);

    //         ['x', 'y', 'z'].forEach(axis => {
    //             boneFolder.add(bone.rotation, axis, -Math.PI, Math.PI)
    //                 .name(`Rotation ${axis.toUpperCase()}`)
    //                 .onChange(() => this.updatePose());
    //         });
    //     });
    // }

    updatePose() {
        this.skinnedMesh.skeleton.update();
    }

    savePose() {
        const pose = {};
        this.skeleton.bones.forEach(bone => {
                pose[bone.name] = {
                    x: bone.rotation.x,
                    y: bone.rotation.y,
                    z: bone.rotation.z
                };
        });
        return JSON.stringify(pose, null);
    }

    loadPose(poseString) {
        const pose = JSON.parse(poseString);
        this.skeleton.bones.forEach(bone => {
            if (pose[bone.name]) {
                bone.rotation.set(
                    pose[bone.name].x,
                    pose[bone.name].y,
                    pose[bone.name].z
                );
            }
        });
        this.updatePose();
    }

    async loadBasePose() {
        try {
            const response = await fetch('src/poses/base Pose.json');
            const poseData = await response.json();
            this.loadPose(JSON.stringify(poseData));
        } catch (error) {
            console.error('Error loading base pose:', error);
        }
    }
}