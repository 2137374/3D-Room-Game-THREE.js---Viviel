/**
 * @license
 * VivielGame
 * Copyright (c) 2024 [Leonardo Sandri]. All Rights Reserved.
 * Proprietary and Confidential - See LICENSE file for details
 */

import { scene, camera, renderer } from './src/scenes/sceneSetup.js';
import { world } from './src/scenes/physicsSetup.js';
import { setupEnvironment } from './src/scenes/environment.js';
import Stats from 'stats.js';
import { CharacterModel } from './src/characters/characterModel.js';
import { RoomManager } from './src/scenes/RoomManager.js';
import { createUIMessage } from './src/utils/UI.js';
// import { CannonDebugRenderer } from './src/utils/cannonDebugRender.js';
import { AudioManager } from './src/utils/audioManager.js';
import { createPetalCounter } from './src/utils/UI.js';


let gameStarted = false;
let lastTime = 0;
let player;
let isPaused = false;
let globalAudioManager;
let roomManager;
let isGameOver = false;

document.addEventListener('DOMContentLoaded', () => {
    const requiredElements = [
        'startButton', 'settingsButton', 'backButton', 'fullscreenOption',
        'resumeButton', 'pauseSettingsButton', 'quitButton',
        'fullscreenOptionGame',
        'applySettingsButton',
        'menu-start', 'menu-settings', 'game-settings', 'pause-menu', 'restartButton'
    ];

    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            console.error(`Element with id "${id}" not found`);
        }
    });

    const startButton = document.getElementById('startButton');
    const settingsButton = document.getElementById('settingsButton');
    const backButton = document.getElementById('backButton');
    const fullscreenOption = document.getElementById('fullscreenOption');
    const resumeButton = document.getElementById('resumeButton');
    const pauseSettingsButton = document.getElementById('pauseSettingsButton');
    const quitButton = document.getElementById('quitButton');
    const fullscreenOptionGame = document.getElementById('fullscreenOptionGame');
    const applySettingsButton = document.getElementById('applySettingsButton');
    const restartButton = document.getElementById('restartButton');

    if (startButton) startButton.addEventListener('click', () => {
        startGame();
        startBackgroundMusic();
    });
    if (backButton) backButton.addEventListener('click', backToMainMenu);
    if (fullscreenOption) fullscreenOption.addEventListener('change', toggleFullscreen);
    if (resumeButton) resumeButton.addEventListener('click', resumeGame);
    if (pauseSettingsButton) pauseSettingsButton.addEventListener('click', showGameSettings);
    if (quitButton) quitButton.addEventListener('click', quitToMainMenu);
    if (fullscreenOptionGame) fullscreenOptionGame.addEventListener('change', toggleFullscreen);
    if (applySettingsButton) applySettingsButton.addEventListener('click', applyGameSettings);
    if (restartButton) { restartButton.addEventListener('click', restartGame);}

    if (settingsButton) {settingsButton.addEventListener('click', showSettings);
    } else {
        console.error('Settings button not found');
    }

    if (pauseSettingsButton) {pauseSettingsButton.addEventListener('click', showGameSettings);
    } else {
        console.error('Pause settings button not found');
    }

    const gameSettingsMenu = document.getElementById('game-settings');
    if (gameSettingsMenu) gameSettingsMenu.style.display = 'none';

    const settingsMenu = document.getElementById('menu-settings');
    if (settingsMenu) settingsMenu.style.display = 'none';

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gameStarted && !isGameOver) {
            togglePause();
        }
    });

    document.getElementById('menu-start').style.display = 'block';
});

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        const menuStart = document.getElementById('menu-start');
        if (menuStart) menuStart.style.display = 'none';
        const fullscreenOption = document.getElementById('fullscreenOption');
        if (fullscreenOption && fullscreenOption.checked) {
            enterFullscreen();
        }
        setupGame();
        hideCursor();
    }
}

function showSettings() {
    hideAllMenus();
    const settingsMenu = document.getElementById('menu-settings');
    if (settingsMenu) {
        settingsMenu.style.display = 'block';
    } else {
        console.error('Settings menu not found');
    }
}

function hideAllMenus() {
    const menus = ['menu-start', 'menu-settings', 'game-settings', 'pause-menu'];
    menus.forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = 'none';
        }
    });
}

function backToMainMenu() {
    document.getElementById('menu-settings').style.display = 'none';
    document.getElementById('menu-start').style.display = 'block';
    document.getElementById('game-settings').style.display = 'none';
}

function toggleFullscreen() {
    if (document.fullscreenElement) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

function togglePause() {
    if (!isGameOver) {
        isPaused = !isPaused;
        document.getElementById('pause-menu').style.display = isPaused ? 'block' : 'none';
        document.getElementById('fullscreenOptionGame').checked = !!document.fullscreenElement;
        if (isPaused) {
            document.getElementById('fullscreenOptionGame').checked = !!document.fullscreenElement;
            showCursor();
        } else {
            hideCursor();
        }
    }
}

function resumeGame() {
    togglePause();
}

function showGameSettings() {
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('game-settings').style.display = 'block';
}

function applyGameSettings() {
    console.log('Applying game settings');
    backToPauseMenu();
}

function backToPauseMenu() {
    document.getElementById('game-settings').style.display = 'none';
    document.getElementById('pause-menu').style.display = 'block';
}

function quitToMainMenu() {
    gameStarted = false;
    isPaused = false;
    document.getElementById('pause-menu').style.display = 'none';
    document.getElementById('menu-start').style.display = 'block';
    showCursor();
    location.reload();
}

function showCursor() {
    document.body.classList.remove('game-active');
}

function hideCursor() {
    document.body.classList.add('game-active');
}

function startBackgroundMusic() {
    if (globalAudioManager) {
        globalAudioManager.playSound('background');
    }
}

// const cannonDebugRenderer = new CannonDebugRenderer(scene, world, {
//     color: 0xff0000,  // Colore rosso per le forme di debug
//     scale: 1
// });

async function setupGame() {
    globalAudioManager = new AudioManager(camera);
    globalAudioManager.loadSound('background', 'src/assets/audio/RPReplay_Final1725390653mp3.m4a', true, 0.5);

    setTimeout(() => {
        globalAudioManager.playSound('background');
    }, 100);

    roomManager = new RoomManager(scene, world, camera, globalAudioManager);
    await roomManager.createRooms();

    await new Promise(resolve => setTimeout(resolve, 500));

    player = new CharacterModel(scene, world, camera);
    window.player = player;
    roomManager.setPlayer(player);

    createPetalCounter();
    createUIMessage();
    setupEnvironment(scene);

    setTimeout(() => {
        if (roomManager.currentRoom && roomManager.currentRoom.audioManager) {
            roomManager.currentRoom.audioManager.playSound('background');
        }
    }, 1200);

    function gameLoop(currentTime) {
        if (gameStarted && !isPaused) {
            requestAnimationFrame(gameLoop);

            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            const fixedDeltaTime = Math.min(deltaTime, 1/60);
            
            world.step(1 / 60);
            // cannonDebugRenderer.update();
            if (player && player.mesh) {
                player.update(fixedDeltaTime);

                const previousRoom = roomManager.currentRoom ? roomManager.currentRoom.id : null;
                roomManager.checkRoomTransition(player);
                if (previousRoom !== roomManager.currentRoom.id) {
                    console.log(`Player transitioned from room ${previousRoom} to room ${roomManager.currentRoom.id}`);
                }            
            }

            if (roomManager.currentRoom && player) {
                const playerPosition = player.getPosition();
                if (playerPosition) {
                    roomManager.currentRoom.update(fixedDeltaTime, playerPosition);
                }
            }

            stats.update();

            renderer.render(scene, camera);
        } else if (gameStarted){
            requestAnimationFrame(gameLoop);
        }
    }
    gameLoop();
}

function showGameOver() {
    isPaused = true;
    isGameOver = true;
    const gameOverMenu = document.getElementById('game-over-menu');
    if (gameOverMenu) {
        gameOverMenu.style.display = 'block';
    }
    showCursor();
}

function completeGame() {        
    const successMenu = document.getElementById('success-menu');
    if (successMenu) {
        successMenu.style.display = 'block';
    }
    showCursor();
}

function restartGame() {
    location.reload();
}

window.savePose = (name) => {
    if (window.player && window.player.PoseControlSystem) {
        return window.player.savePose(name);
    } else {
        console.error("Player or PoseControlSystem not initialized");
    }
};

window.loadPose = (name) => {
    if (window.player && window.player.PoseControlSystem) {
        window.player.loadPose(name);
    } else {
        console.error("Player or PoseControlSystem not initialized");
    }
};

window.showGameOver = showGameOver;
window.completeGame = completeGame;

// FPS counter
const stats = new Stats();
document.body.appendChild(stats.dom);
