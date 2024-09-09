import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);
        
        this.sounds = {};
        this.audioLoader = new THREE.AudioLoader();
    }

    loadSound(name, path, loop = false, volume = 1) {
        const sound = new THREE.Audio(this.listener);
        this.audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(loop);
            sound.setVolume(volume);
            console.log(`Sound ${name} loaded successfully`);
        }, undefined, (error) => {
            console.error(`Error loading sound ${name}:`, error);
        });
        this.sounds[name] = sound;
    }

    playSound(name) {
        if (this.sounds[name]) {
            if (this.sounds[name].isPlaying) {
                this.sounds[name].stop();
            }
            if (this.sounds[name].buffer) {
                this.sounds[name].play();
                console.log(`Playing sound: ${name}`);
            } else {
                console.warn(`Sound ${name} not ready to play yet`);
            }
        } else {
            console.warn(`Sound ${name} not found`);
        }
    }

    isSoundReady(name) {
        return this.sounds[name] && this.sounds[name].buffer !== null;
    }

    stopSound(name) {
        if (this.sounds[name] && this.sounds[name].isPlaying) {
            this.sounds[name].stop();
        }
    }

    stopAllSounds() {
        Object.keys(this.sounds).forEach(sound => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
    }

    getAudioContext() {
        return this.listener.context;
    }
}