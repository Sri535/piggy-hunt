import * as THREE from 'three';

let scene, camera, renderer, clock, controls;
let piggies = [];
let score = 0;
let isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

// Initialization
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky Blue
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();

    setupLights();
    createEnvironment();
    spawnPiggies(10);
    setupControls();

    animate();
}

function setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0x404040, 2));
}

function createEnvironment() {
    // Grass Floor
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2d5e1e });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Procedural Trees
    for(let i=0; i<50; i++) {
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2), new THREE.MeshStandardMaterial({color: 0x4d2902}));
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshStandardMaterial({color: 0x1e3d11}));
        leaves.position.y = 2;
        tree.add(trunk, leaves);
        tree.position.set(Math.random()*100-50, 1, Math.random()*100-50);
        scene.add(tree);
    }
}

function spawnPiggies(count) {
    for(let i=0; i<count; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffc0cb }); // Pink
        const piggy = new THREE.Mesh(geometry, material);
        
        piggy.position.set(
            Math.random() * 40 - 20,
            0.5,
            Math.random() * 40 - 20
        );
        piggy.userData = { id: i, type: 'common' };
        piggies.push(piggy);
        scene.add(piggy);
    }
}

function setupControls() {
    if (isMobile) {
        window.addEventListener('deviceorientation', (e) => {
            // Gyroscope Logic
            const alpha = e.alpha ? THREE.MathUtils.degToRad(e.alpha) : 0; // Z
            const beta = e.beta ? THREE.MathUtils.degToRad(e.beta) : 0;   // X
            camera.rotation.set(beta - Math.PI/2, 0, alpha);
        });
    } else {
        // Desktop WASD + Mouse
        document.addEventListener('mousemove', (e) => {
            camera.rotation.y -= e.movementX * 0.002;
            camera.rotation.x -= e.movementY * 0.002;
        });
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
            checkCapture();
        });
    }
}

function checkCapture() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
    const intersects = raycaster.intersectObjects(piggies);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        scene.remove(hit);
        score += 10;
        document.getElementById('coin-count').innerText = score;
        // Simple Audio Feedback (Synthesized)
        playCaptureSound();
    }
}

function playCaptureSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    gain.gain.fadeOut = 0.1;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getElapsedTime();
    
    // Animate Piggies
    piggies.forEach(p => {
        p.position.y = 0.5 + Math.sin(delta * 2 + p.position.x) * 0.2;
    });

    renderer.render(scene, camera);
}

// Global Start Function
window.startGame = () => {
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission();
    }
    init();
};