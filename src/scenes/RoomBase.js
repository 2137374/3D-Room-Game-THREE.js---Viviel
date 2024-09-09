import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class RoomBase {
    constructor(config, roomManager) {
        this.id = config.id;
        this.size = config.size;
        this.position = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
        this.connections = config.connections;
        this.roomManager = roomManager;
        this.mesh = null;
        this.physicsBodies = [];
        this.decorativeObjects = [];
        this.input = null;
        this.textureLoader = new THREE.TextureLoader();
        this.materials = {
            floor: new THREE.MeshStandardMaterial({ 
                color: 0x808080,
                roughness: 0.8,
                metalness: 0.2,
                side: THREE.DoubleSide
            }),
            ceiling: new THREE.MeshStandardMaterial({ 
                color: 0x808080, 
                roughness: 0.6,
                metalness: 0.1,
                side: THREE.DoubleSide }),
            walls: new THREE.MeshStandardMaterial({ 
                color: 0x808080, 
                roughness: 0.7,
                metalness: 0.1,
                side: THREE.DoubleSide })
        };
        this.texturesLoaded = false;
    }

    addDecorativeObject(object) {
        this.decorativeObjects.push(object);
    }

    createLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 2, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);

        pointLight.shadow.mapSize.width = 512;
        pointLight.shadow.mapSize.height = 512;
        pointLight.shadow.camera.near = 0.5;
        pointLight.shadow.camera.far = 500;
    }

    removeDecorativeObjects(scene, world) {
        this.decorativeObjects.forEach(obj => {
            if (obj instanceof THREE.Object3D) {
                scene.remove(obj);
            } else if (obj instanceof CANNON.Body) {
                world.removeBody(obj);
            }
        });
        this.decorativeObjects = [];
    }

    async loadTextures() {
        const texturePaths = {
            floor: 'src/assets/textures/cardboard.jpg',
            ceiling: 'src/assets/textures/cardboard.jpg',
            walls: 'src/assets/textures/cardboard.jpg'
        };

        const texturePromises = Object.entries(texturePaths).map(([key, path]) => {
            return new Promise((resolve, reject) => {
                this.textureLoader.load(
                    path,
                    (texture) => {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(50, 50);
                        this.materials[key].map = texture;
                        this.materials[key].needsUpdate = true;
                        resolve();
                    },
                    undefined,
                    (error) => reject(`Error loading ${key} texture: ${error}`)
                );
            });
        });

        try {
            await Promise.all(texturePromises);
            this.texturesLoaded = true;
            console.log(`Textures loaded for Room ${this.id}`);
        } catch (error) {
            console.error(`Error loading textures for Room ${this.id}:`, error);
        }
    }

    async createGeometry(scene) {
        if (!this.texturesLoaded) {
            await this.loadTextures();
        }

        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
        const materials = [
            this.materials.walls,  // right
            this.materials.walls,  // left
            this.materials.ceiling,  // top
            this.materials.floor,  // bottom
            this.materials.walls,  // front
            this.materials.walls   // back
        ];
        this.mesh = new THREE.Mesh(geometry, materials);
        this.mesh.position.copy(this.position);
        this.mesh.name = `Room${this.id}`;
        scene.add(this.mesh);
        console.log(`Room ${this.id} geometry created and added to scene`);
        this.addDecorativeObject(this.mesh);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
    }

    setInput(input) {
        this.input = input;
    }

    update(deltaTime) {
        if (this.input){}
    }

    createPhysics(world) {
        const wallThickness = 0.2; // Spessore delle pareti
        const halfWidth = this.size.width / 2;
        const halfHeight = this.size.height / 2;
        const halfDepth = this.size.depth / 2;
    
        // Crea pareti, pavimento e soffitto
        const surfaces = [
            { size: [halfWidth, halfHeight, wallThickness / 2], position: [0, 0, halfDepth+0.07] },  // Parete frontale
            { size: [halfWidth, halfHeight, wallThickness / 2], position: [0, 0, -halfDepth-0.07] }, // Parete posteriore
            { size: [wallThickness / 2, halfHeight, halfDepth], position: [halfWidth+0.07, 0, 0] },  // Parete destra
            { size: [wallThickness / 2, halfHeight, halfDepth], position: [-halfWidth-0.07, 0, 0] }, // Parete sinistra
            { size: [halfWidth, wallThickness / 2, halfDepth], position: [0, halfHeight+0.07, 0] },  // Soffitto
            { size: [halfWidth, wallThickness / 2, halfDepth], position: [0, -halfHeight-0.07, 0] }  // Pavimento
        ];
    
        surfaces.forEach(surface => {
            const shape = new CANNON.Box(new CANNON.Vec3(surface.size[0], surface.size[1], surface.size[2]));
            const body = new CANNON.Body({
                mass: 0, 
                shape: shape,
                position: new CANNON.Vec3(
                    this.position.x + surface.position[0],
                    this.position.y + surface.position[1],
                    this.position.z + surface.position[2]
                ),
                collisionFilterGroup: 1,
                collisionFilterMask: 2
            });
            world.addBody(body);
            this.physicsBodies.push(body);
        });
    }

    removeFromScene(scene) {
        if (this.mesh) {
            console.log(`Removing mesh for Room${this.id} from scene`);
            scene.remove(this.mesh);
        }
        this.removeDecorativeObjects(scene, this.roomManager.world);
        console.log(`Room ${this.id} cleaned up`);
    }

    addToScene(scene) {
        if (this.mesh) scene.add(this.mesh);
    }

    removePhysics(world) {
        this.physicsBodies.forEach(body => world.removeBody(body));
        this.physicsBodies = [];
    }

    decorate(scene) {
        // default empty
    }

    getDoors() {
        return this.doors;
    }
}