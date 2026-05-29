import * as THREE from 'three';

// --- GAME STATE & CONSTANTS ---
let scene, camera, renderer, clock;
let piggies = [];
let score = 0;
let playerLevel = 1;
let currentXp = 0;
let xpToNextLevel = 50; // Initial XP needed for Lv 2
const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

// --- INITIALIZATION ---
function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky Blue
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.02);

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Height of a person

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('game-canvas'), 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();

    // 4. World Building
    setupLights();
    createEnvironment();
    spawnPiggies(10);
    setupControls();
    
    // Initial UI Sync
    updateXpUI();

    // Start Loop
    animate();
}

// --- LIGHTING ---
function setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x404040, 2));
}

// --- ENVIRONMENT ---
function createEnvironment() {
    // Grass Floor
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d5e1e });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Procedural Trees
    for(let i=0; i<60; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 2), 
            new THREE.MeshStandardMaterial({color: 0x4d2902})
        );
        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(1.5, 4, 8), 
            new THREE.MeshStandardMaterial({color: 0x1e3d11})
        );
        leaves.position.y = 2;
        tree.add(trunk, leaves);
        
        // Random placement
        const x = Math.random() * 100 - 50;
        const z = Math.random() * 100 - 50;
        // Keep center clear for player spawn
        if (Math.abs(x) < 5 && Math.abs(z) < 5) continue; 
        
        tree.position.set(x, 1, z);
        scene.add(tree);
    }
}

// --- PIGGY LOGIC ---
function spawnPiggies(count) {
    for(let i=0; i<count; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xffc0cb,
            roughness: 0.3,
            metalness: 0.2
        }); 
        const piggy = new THREE.Mesh(geometry, material);
        
        piggy.position.set(
            Math.random() * 60 - 30,
            0.5,
            Math.random() * 60 - 30
        );
        
        // Custom Data for logic
        piggy.userData = { 
            id: Date.now() + i, 
            xpValue: 10,
            floatOffset: Math.random() * Math.PI * 2 
        };
        
        piggies.push(piggy);
        scene.add(piggy);
    }
}

// --- INPUT & CONTROLS ---
function setupControls() {
    if (isMobile) {
        window.addEventListener('deviceorientation', (e) => {
            // Beta is X rotation (tilt front/back), Alpha is Z rotation (compass)
            const alpha = e.alpha ? THREE.MathUtils.degToRad(e.alpha) : 0;
            const beta = e.beta ? THREE.MathUtils.degToRad(e.beta) : 0;
            
            // Adjust for natural phone holding angle
            camera.rotation.set(beta - Math.PI/2, 0, alpha, 'YXZ');
        });

        // Mobile Tap to Shoot
        window.addEventListener('touchstart', (e) => {
            checkCapture();
        }, false);

    } else {
        // Desktop Pointer Lock (Mouse Look)
        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === document.body) {
                camera.rotation.y -= e.movementX * 0.002;
                camera.rotation.x -= e.movementY * 0.002;
                // Limit vertical look
                camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
            }
        });

        document.addEventListener('mousedown', () => {
            if (document.pointerLockElement !== document.body) {
                document.body.requestPointerLock();
            } else {
                checkCapture();
            }
        });
    }
}

// --- CAPTURE & XP SYSTEM ---
function checkCapture() {
    const raycaster = new THREE.Raycaster();
    // Center of screen
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    const intersects = raycaster.intersectObjects(piggies);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        
        // Visual Feedback: Flash or Scale
        hit.scale.set(0, 0, 0); 
        
        // Remove from tracking array
        piggies = piggies.filter(p => p !== hit);
        scene.remove(hit);
        
        // Update Score
        score += 10;
        document.getElementById('coin-count').innerText = score;
        
        // Update XP
        handleXpGain(hit.userData.xpValue);
        playCaptureSound();

        // Replenish if low
        if (piggies.length < 5) {
            spawnPiggies(5);
        }
    }
}

function handleXpGain(amount) {
    currentXp += amount;
    
    // Level Up Check
    while (currentXp >= xpToNextLevel) {
        currentXp -= xpToNextLevel;
        playerLevel++;
        xpToNextLevel = playerLevel * 50; // Dynamic Difficulty
        
        // Flash Level Text
        const levelText = document.getElementById('xp-level');
        levelText.style.color = '#ffff00';
        setTimeout(() => levelText.style.color = 'white', 500);
    }
    
    updateXpUI();
}

function updateXpUI() {
    const fillPercent = (currentXp / xpToNextLevel) * 100;
    const remaining = xpToNextLevel - currentXp;

    document.getElementById('xp-level').innerText = `Lv. ${playerLevel}`;
    document.getElementById('xp-bar-fill').style.width = `${fillPercent}%`;
    document.getElementById('xp-remaining-text').innerText = `${remaining} XP to next level`;
}

// --- AUDIO (Synth) ---
function playCaptureSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
    
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Animate Piggy Floating
    piggies.forEach(p => {
        p.position.y = 0.5 + Math.sin(time * 2 + p.userData.floatOffset) * 0.2;
        p.rotation.y += 0.02;
    });

    renderer.render(scene, camera);
}

// --- GLOBAL START ---
window.startGame = () => {
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    
    // Request Sensors for iOS
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') init();
            })
            .catch(console.error);
    } else {
        init(); // Desktop or Android
    }
};

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
