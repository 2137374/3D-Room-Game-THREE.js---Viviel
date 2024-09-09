import * as THREE from 'three';
import { input } from '../controllers/Input.js';
import * as CANNON from 'cannon-es';

export class CharacterMovement {
    constructor(mesh, body, camera, scene, world) {
        this.mesh = mesh;
        this.body = body;
        this.camera = camera;
        this.scene = scene;
        this.world = world;

        this.isWalking = false;

        this.moveSpeed = 8;
        this.currentVelocity = new THREE.Vector3();
        this.isMovingBackward = false;
        this.isMovingForward = false;
        this.movementDirection = new THREE.Vector3();

        // Camera setup
        this.cameraOffset = new THREE.Vector3(-0.1, 0.15, -0.32); 
        this.cameraLookAtOffset = new THREE.Vector3(0, 0.2, 0.35); 

        // Character and camera rotation
        this.rotationAngle = 2*Math.PI;
        this.rotationSpeed = 0.05;

        this.cameraRay = new CANNON.Ray();
        this.maxCameraDistance = 0.2; 

        // Mouse control
        this.mouseSensitivity = 0.004;

        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    }

    onMouseMove(event) {
        this.rotationAngle -= event.movementX * this.mouseSensitivity;
    }

    update(deltaTime) {
        this.handleMovement(deltaTime);
        this.updateCharacterRotation();
        this.updateCamera();
    }

    handleMovement(deltaTime) {
        const moveVector = input.getMovementVector();

        this.movementDirection.copy(moveVector);
        this.movementDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationAngle);
        this.movementDirection.normalize();

        const targetVelocity = this.movementDirection.clone().multiplyScalar(this.moveSpeed);

        this.currentVelocity.lerp(targetVelocity, 0.1);

        const forwardVector = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationAngle);
        const movementDot =forwardVector.dot(this.movementDirection);

        this.isMovingForward = movementDot < 0 && this.movementDirection.lengthSq() > 0.001;
        this.isMovingBackward = movementDot > 0 && this.movementDirection.lengthSq() > 0.001;
        this.isWalking = moveVector.lengthSq() > 0.001;

        this.body.velocity.x = this.currentVelocity.x;
        this.body.velocity.z = this.currentVelocity.z;

        this.mesh.position.copy(this.body.position);

        return this.isWalking;
    }

    getIsMovingForward() {
        return this.isMovingForward;
    }

    getIsMovingBackward() {
        return this.isMovingBackward;
    }

    updateCharacterRotation() {
        // Rotate the character mesh
        this.mesh.rotation.y = this.rotationAngle;
        
        // Rotate the physics body
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationAngle);
        this.body.quaternion.copy(quaternion);
    }

    getIsWalking() {
        return this.isWalking;
    }

    updateCamera() {
        // Calculate camera position based on character position and rotation
        const desiredCameraPosition = this.cameraOffset.clone();
        desiredCameraPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationAngle);
        desiredCameraPosition.add(this.mesh.position);

        // Update camera position
        this.cameraRay.from.copy(this.mesh.position);
        this.cameraRay.to.copy(desiredCameraPosition);
        
        const result = this.world.raycastClosest(this.cameraRay);

        if (result.hasHit) {
            const hitPointDistance = this.mesh.position.distanceTo(result.hitPointWorld);
            const cameraDistance = Math.min(hitPointDistance - 0.1, this.maxCameraDistance);
            const direction = new THREE.Vector3().subVectors(desiredCameraPosition, this.mesh.position).normalize();
            this.camera.position.copy(this.mesh.position).add(direction.multiplyScalar(cameraDistance));
        } else {
            this.camera.position.copy(desiredCameraPosition);
        }

        // Calculate and set camera look-at point
        const lookAtPoint = this.cameraLookAtOffset.clone();
        lookAtPoint.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationAngle);
        lookAtPoint.add(this.mesh.position);
        this.camera.lookAt(lookAtPoint);
        input.resetMouseMovement();
    }
}