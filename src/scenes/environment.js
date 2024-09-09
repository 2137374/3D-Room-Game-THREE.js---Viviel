import * as THREE from 'three';

export function setupEnvironment(scene) {
    const ambientLight = new THREE.AmbientLight(0x404040, 10); // TODO: work with light
    scene.add(ambientLight);

    // fog
    scene.fog = new THREE.FogExp2(0x000000, 0.1, 10000);   
}