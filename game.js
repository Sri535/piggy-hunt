import * as THREE from 'three';

// --- CONFIGURATION ---
const WORLD_CONFIG = {
    1: { name: "Enchanted Forest", sky: 0x87ceeb, fog: 0x87ceeb, floor: 0x2d5e1e, count: 10 },
    2: { name: "Sunset Desert", sky: 0xffa500, fog: 0xff4500, floor: 0xd2b48c, count: 15 },
    3: { name: "Neon Void", sky: 0x000000, fog: 0x111111, floor: 0x220033, count: 20 }
};

let scene, camera, renderer, clock;
let piggies = [];
let score = 0, playerLevel = 1, currentXp = 0, xpToNextLevel = 50;
let floorMesh, sunLight;

const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    clock = new THREE.Clock();

    // Setup Initial World
    sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(10, 20, 10);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial();
    floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    scene.add(floorMesh);

    applyWorldTheme(1);
    setupControls();
    updateXpUI();
    animate();
}

// --- LEVEL & SCENE TRANSITION LOGIC ---
function applyWorldTheme(level) {
    const config = WORLD_CONFIG[level] || WORLD_CONFIG[3]; // Default to space if high level
    
    // Smoothly transition colors
    scene.background = new THREE.Color(config.sky);
    scene.fog = new THREE.FogExp2(config.fog, 0.02);
    floorMesh.material.color.setHex(config.floor);

    // Clear old trees and spawn new piggies
    piggies.forEach(p => scene.remove(p));
    piggies = [];
    spawnPiggies(config.count);

    // UI Announcement
    const ann = document.getElementById('world-announcement');
    if(ann) {
        ann.innerText = `Entering: ${config.name}`;
        ann.classList.add('show');
        setTimeout(() => ann.classList.remove('show'), 3000);
    }
}

function handleXpGain(amount) {
    currentXp += amount;
    
    if (currentXp >= xpToNextLevel) {
        currentXp = 0; // Reset for next level
        playerLevel++;
        xpToNextLevel = playerLevel * 50; 
        
        applyWorldTheme(playerLevel); // CHANGE SCENE
    }
    updateXpUI();
}

function updateXpUI() {
    const fillPercent = (currentXp / xpToNextLevel) * 100;
    const remaining = xpToNextLevel - currentXp;

    // Direct DOM updates - ensures bars move
    const fillBar = document.getElementById('xp-bar-fill');
    const levelText = document.getElementById('xp-level');
    const remText = document.getElementById('xp-remaining-text');

    if(fillBar) fillBar.style.width = `${fillPercent}%`;
    if(levelText) levelText.innerText = `Lv. ${playerLevel}`;
    if(remText) remText.innerText = `${remaining} XP to next level`;
}

// --- CORE MECHANICS ---
function spawnPiggies(count) {
    for(let i=0; i<count; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 24, 24);
        const material = new THREE.MeshStandardMaterial({ color: 0xffc0cb }); 
        const piggy = new THREE.Mesh(geometry, material);
        piggy.position.set(Math.random()*40-20, 0.5, Math.random()*40-20);
        piggy.userData = { xpValue: 10, floatOffset: Math.random()*5 };
        piggies.push(piggy);
        scene.add(piggy);
    }
}

function checkCapture() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(piggies);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        piggies = piggies.filter(p => p !== hit);
        scene.remove(hit);
        
        score += 10;
        document.getElementById('coin-count').innerText = score;
        
        handleXpGain(10); // Gain XP
        playCaptureSound();
    }
}

// --- CONTROLS & ANIMATION ---
function setupControls() {
    if (isMobile) {
        window.addEventListener('deviceorientation', (e) => {
            const alpha = e.alpha ? THREE.MathUtils.degToRad(e.alpha) : 0;
            const beta = e.beta ? THREE.MathUtils.degToRad(e.beta) : 0;
            camera.rotation.set(beta - Math.PI/2, 0, alpha, 'YXZ');
        });
        window.addEventListener('touchstart', checkCapture);
    } else {
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                camera.rotation.y -= e.movementX * 0.002;
                camera.rotation.x -= e.movementY * 0.002;
            }
        });
        document.addEventListener('mousedown', () => {
            if (document.pointerLockElement !== document.body) document.body.requestPointerLock();
            else checkCapture();
        });
    }
}

function playCaptureSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    piggies.forEach(p => {
        p.position.y = 0.5 + Math.sin(time * 2 + p.userData.floatOffset) * 0.2;
    });
    renderer.render(scene, camera);
}

window.startGame = () => {
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    init();
};
