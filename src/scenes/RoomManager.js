import * as THREE from 'three';
import { input } from '../controllers/Input.js';
import { showUIMessage } from '../utils/UI.js';
import { RoomBase } from './RoomBase.js';
import { Room1 } from './rooms/Room1.js';
import { Room2 } from './rooms/Room2.js';
import { Room4 } from './rooms/Room4.js';
import { Room5 } from './rooms/Room5.js';
import { Room7 } from './rooms/Room7.js';
import { Room8 } from './rooms/Room8.js';
import { Room9 } from './rooms/Room9.js';

export class RoomManager { 
    constructor(scene, world, camera, audioManager) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.audioManager = audioManager;
        this.rooms = {};
        this.currentRoom = null;
        this.player = window.player;
        this.currentRoomId = null;
        this.ambientLight = null;
        this.input = input;
    }

    setPlayer(player) {
        this.player = player;
    }

    setAmbientLight(light) {
        this.ambientLight = light;
    }

    async createRooms() {
        const roomConfig = [
            { id: 1, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [2], specialFeatures: { trapDoor: true } },
            { id: 2, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [1, 4] },
            { id: 4, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [2, 5, 7, 9] },
            { id: 5, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [4] },
            { id: 7, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [4, 8] },
            { id: 8, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [7, 9] },
            { id: 9, size: { width: 3, height: 1, depth: 3 }, position: { x: 0, y: 0, z: 0 }, connections: [8, 4] }
        ];

        const roomPromises = roomConfig.map(async config => {
            let room;
            switch(config.id) {
                case 1: room = new Room1(config, this, this.audioManager); break;
                case 2: room = new Room2(config, this, this.audioManager); break;
                case 4: room = new Room4(config, this, this.audioManager); break;
                case 5: room = new Room5(config, this, this.audioManager); break;
                case 7: room = new Room7(config, this, this.audioManager); break;
                case 8: room = new Room8(config, this, this.audioManager); break;
                case 9: room = new Room9(config, this, this.audioManager); break;
                default: room = new RoomBase(config, this, this.audioManager);
            }
            this.rooms[config.id] = room;
            await room.createGeometry(this.scene);
            return room;
        });

        await Promise.all(roomPromises);
        await this.setCurrentRoom(4);
        return this.rooms;
    }

    getRoom (roomId) {
        return this.rooms[roomId];
    }

    async setCurrentRoom(roomId) {
        console.log(`Transitioning to room ${roomId}`);
        
        if (this.currentRoom) {
            await this.currentRoom.removePhysics(this.world);
            await this.currentRoom.removeFromScene(this.scene);
        }

        this.currentRoom = this.rooms[roomId];
        if (this.currentRoom) {
            await this.currentRoom.createGeometry(this.scene);
            await this.currentRoom.createPhysics(this.world);
            await this.currentRoom.decorate(this.scene, this.world);
            this.currentRoom.setInput(this.input);

            if (this.player && !this.scene.getObjectById(this.player.mesh.id)) {
                this.scene.add(this.player.mesh);
            }

            if (this.ambientLight && !this.scene.getObjectById(this.ambientLight.id)) {
                this.scene.add(this.ambientLight);
            }

            if (this.player) {
                this.player.setCurrentRoomId(roomId);
            }

        } else {
            console.error(`Room ${roomId} not found`);
        }
        console.log(`Transition to room ${roomId} complete`);
    }

    update(deltaTime) {
        if (this.currentRoom && this.player) {
            const playerPosition = this.player.getPosition();
            if (playerPosition) {
                this.currentRoom.update(deltaTime, playerPosition);
            }
        }
    }

    transitionToRoom(newRoomId, entryPoint) {
        const newRoom = this.rooms[newRoomId];
        if (!newRoom) return;
    
        const offset = 0.5;
        let entryPosition;
        switch(entryPoint) {
            case 'north':
                entryPosition = new THREE.Vector3(newRoom.position.x, newRoom.position.y - 0.4, newRoom.position.z + newRoom.size.depth/2 - offset);
                break;
            case 'south':
                entryPosition = new THREE.Vector3(newRoom.position.x, newRoom.position.y - 0.4, newRoom.position.z - newRoom.size.depth/2 + offset);
                break;
            case 'east':
                entryPosition = new THREE.Vector3(newRoom.position.x + newRoom.size.width/2 - offset, newRoom.position.y - 0.4, newRoom.position.z);
                break;
            case 'west':
                entryPosition = new THREE.Vector3(newRoom.position.x - newRoom.size.width/2 + offset, newRoom.position.y - 0.4, newRoom.position.z);
                break;
        }
        return entryPosition;
    }

    checkRoomTransition(player) {
        if (!this.currentRoom) return;

        const playerPosition = player.mesh.position;
        let nearDoor = false;

        const doors = this.currentRoom.getDoors();
        doors.forEach(door => {
            const distanceToDoor = playerPosition.distanceTo(door.position);
            if (distanceToDoor < 0.5) {
                nearDoor = true;
                showUIMessage("press P to enter the next room");

                if (input.keys['p']) {
                    console.log(`Player transitioning from room ${this.currentRoom.id} to room ${door.connection}`);
                    const newPosition = this.transitionToRoom(door.connection, this.getOppositeEntryPoint(door.rotation));
                    player.mesh.position.copy(newPosition);
                    player.body.position.copy(newPosition);
                    console.log(`About to call setCurrentRoom with roomId: ${door.connection}`); // Add this line
                    this.setCurrentRoom(door.connection);
                }
            }
        });

        if (!nearDoor) {
            showUIMessage("");
        }
    }

    checkPumpkinInteraction(playerPosition, dialogueOptions) {
        if (!this.currentRoom || !this.currentRoom.pumpkins) return;

        this.currentRoom.pumpkins.forEach(pumpkin => {
            const isNearPumpkin = pumpkin.checkPlayerProximity(playerPosition);
            if (isNearPumpkin) {
                showUIMessage("Press T to talk to the pumpkin");
                
                if (this.input.keys['t']) {
                    if (!pumpkin.isDialogueActive) {
                        console.log('Player starting conversation with pumpkin');
                        pumpkin.startTalking();
                    } else {
                        console.log('Player progressing dialogue with pumpkin');
                        pumpkin.progressDialogue();
                    }
                    this.input.keys['t'] = false;
                }
            } else {
                if (pumpkin.isTalking) {
                    pumpkin.stopTalking();
                }
            }
        });
    }

    getOppositeEntryPoint(doorRotation) {
        if (doorRotation.y == 0) return 'south';
        if (doorRotation.y == Math.PI) return 'north';
        if (doorRotation.y == Math.PI/2) return 'west';
        if (doorRotation.y == -Math.PI/2) return 'east';
    }
}