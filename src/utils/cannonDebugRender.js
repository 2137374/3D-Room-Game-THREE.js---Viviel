import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class CannonDebugRenderer {
    constructor(scene, world, options = {}) {
        this.scene = scene;
        this.world = world;

        this.options = Object.assign({
            color: 0x00ff00,
            scale: 1,
            sphereSegments: 8,
            cylinderSegments: 8
        }, options);

        this.geometries = {};
        this.materials = {};
        this.meshes = [];
        this.material = new THREE.MeshBasicMaterial({ color: this.options.color, wireframe: true });
    }

    update() {
        // Remove all previous meshes
        this.meshes.forEach(mesh => this.scene.remove(mesh));
        this.meshes = [];

        // Iterate over all bodies
        this.world.bodies.forEach(body => {
            body.shapes.forEach((shape, shapeIndex) => {
                let mesh = this._createMesh(shape);

                if (mesh) {
                    mesh.position.copy(body.position);
                    mesh.quaternion.copy(body.quaternion);

                    this.scene.add(mesh);
                    this.meshes.push(mesh);
                }
            });
        });
    }

    _createMesh(shape) {
        let mesh = null;
        let geometry = null;
        let points = null;

        switch(shape.type) {
            case CANNON.Shape.types.SPHERE:
                geometry = this._sphereGeometry(shape);
                mesh = new THREE.Mesh(geometry, this.material);
                break;

            case CANNON.Shape.types.BOX:
                geometry = this._boxGeometry(shape);
                mesh = new THREE.Mesh(geometry, this.material);
                break;

            case CANNON.Shape.types.PLANE:
                geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
                mesh = new THREE.Mesh(geometry, this.material);
                mesh.scale.set(this.options.scale, this.options.scale, this.options.scale);
                break;

            default:
                console.warn("Unhandled shape type:", shape.type);
                break;
        }

        if (mesh) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
        }

        return mesh;
    }

    _sphereGeometry(shape) {
        if (!this.geometries[shape.id]) {
            this.geometries[shape.id] = new THREE.SphereGeometry(shape.radius, this.options.sphereSegments, this.options.sphereSegments);
        }
        return this.geometries[shape.id];
    }

    _boxGeometry(shape) {
        if (!this.geometries[shape.id]) {
            const sx = shape.halfExtents.x * 2;
            const sy = shape.halfExtents.y * 2;
            const sz = shape.halfExtents.z * 2;
            this.geometries[shape.id] = new THREE.BoxGeometry(sx, sy, sz);
        }
        return this.geometries[shape.id];
    }

    destroy() {
        this.meshes.forEach(mesh => this.scene.remove(mesh));
    }
}