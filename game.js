import * as THREE from "three";

/* =====================================================
   GLOBALS
===================================================== */

export const Game = {
    scene: null,
    camera: null,
    renderer: null,
    clock: new THREE.Clock(),

    player: {
        level: 1,
        xp: 0,
        coins: 0,
        gems: 0
    },

    world: {
        current: "forest",
        piggies: []
    },

    controls: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false
    },

    mobile: /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
    )
};

/* =====================================================
   INIT
===================================================== */

init();

async function init() {

    createRenderer();
    createScene();
    createCamera();

    createLights();
    createGround();
    createSky();

    createCrosshairRaycaster();

    spawnInitialPiggies();

    registerDesktopControls();
    registerGyroscope();

    loadSave();

    animate();

    setInterval(autoSave, 30000);
}

/* =====================================================
   RENDERER
===================================================== */

function createRenderer() {

    const canvas =
        document.getElementById("gameCanvas");

    Game.renderer =
        new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });

    Game.renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    Game.renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    Game.renderer.shadowMap.enabled = true;

    Game.renderer.outputColorSpace =
        THREE.SRGBColorSpace;
}

/* =====================================================
   SCENE
===================================================== */

function createScene() {

    Game.scene = new THREE.Scene();

    Game.scene.fog =
        new THREE.FogExp2(
            0x9fd6ff,
            0.003
        );
}

/* =====================================================
   CAMERA
===================================================== */

function createCamera() {

    Game.camera =
        new THREE.PerspectiveCamera(
            75,
            window.innerWidth /
            window.innerHeight,
            0.1,
            2000
        );

    Game.camera.position.set(
        0,
        3,
        10
    );
}

/* =====================================================
   LIGHTING
===================================================== */

let sun;

function createLights() {

    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            1
        );

    Game.scene.add(ambient);

    sun =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    sun.position.set(
        50,
        100,
        20
    );

    sun.castShadow = true;

    Game.scene.add(sun);
}

/* =====================================================
   SKY
===================================================== */

function createSky() {

    const geo =
        new THREE.SphereGeometry(
            800,
            32,
            32
        );

    const mat =
        new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            side: THREE.BackSide
        });

    const sky =
        new THREE.Mesh(geo, mat);

    Game.scene.add(sky);
}

/* =====================================================
   GROUND
===================================================== */

function createGround() {

    const geo =
        new THREE.PlaneGeometry(
            1000,
            1000,
            64,
            64
        );

    const mat =
        new THREE.MeshStandardMaterial({
            color: 0x3a8f3a
        });

    const ground =
        new THREE.Mesh(
            geo,
            mat
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    Game.scene.add(ground);
}

/* =====================================================
   PIGGY CREATION
===================================================== */

function createPiggy(type="common") {

    const group =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                1,
                24,
                24
            ),
            new THREE.MeshStandardMaterial({
                color:
                    type === "golden"
                        ? 0xffd700
                        : 0xffa6d8
            })
        );

    group.add(body);

    group.position.set(
        THREE.MathUtils.randFloatSpread(200),
        1,
        THREE.MathUtils.randFloatSpread(200)
    );

    group.userData.type = type;

    Game.scene.add(group);

    Game.world.piggies.push(group);
}

function spawnInitialPiggies() {

    for(let i=0;i<25;i++)
        createPiggy("common");

    for(let i=0;i<5;i++)
        createPiggy("golden");
}

/* =====================================================
   RAYCAST CAPTURE
===================================================== */

let raycaster;
let mouse;

function createCrosshairRaycaster() {

    raycaster =
        new THREE.Raycaster();

    mouse =
        new THREE.Vector2(0,0);

    const btn =
        document.getElementById(
            "captureBtn"
        );

    btn.addEventListener(
        "click",
        capturePiggy
    );
}

function capturePiggy() {

    raycaster.setFromCamera(
        mouse,
        Game.camera
    );

    const hits =
        raycaster.intersectObjects(
            Game.world.piggies,
            true
        );

    if(hits.length === 0)
        return;

    const piggy =
        hits[0].object.parent;

    rewardPiggy(
        piggy.userData.type
    );

    Game.scene.remove(piggy);

    Game.world.piggies =
        Game.world.piggies.filter(
            p => p !== piggy
        );
}

/* =====================================================
   REWARDS
===================================================== */

function rewardPiggy(type) {

    let reward = 10;

    if(type==="golden")
        reward = 50;

    Game.player.coins += reward;
    Game.player.xp += reward;

    updateHUD();
}

/* =====================================================
   HUD
===================================================== */

function updateHUD() {

    document.getElementById(
        "coins"
    ).textContent =
        Game.player.coins;

    document.getElementById(
        "level"
    ).textContent =
        Game.player.level;

    const xpFill =
        document.getElementById(
            "xpFill"
        );

    xpFill.style.width =
        (Game.player.xp % 100)
        + "%";

    if(Game.player.xp >=
       Game.player.level * 100)
    {
        Game.player.level++;
    }
}

/* =====================================================
   DESKTOP CONTROLS
===================================================== */

function registerDesktopControls() {

    document.addEventListener(
        "keydown",
        e => {

            switch(e.code){

                case "KeyW":
                    Game.controls.forward=true;
                    break;

                case "KeyS":
                    Game.controls.backward=true;
                    break;

                case "KeyA":
                    Game.controls.left=true;
                    break;

                case "KeyD":
                    Game.controls.right=true;
                    break;

                case "ShiftLeft":
                    Game.controls.sprint=true;
                    break;
            }
        }
    );

    document.addEventListener(
        "keyup",
        e => {

            switch(e.code){

                case "KeyW":
                    Game.controls.forward=false;
                    break;

                case "KeyS":
                    Game.controls.backward=false;
                    break;

                case "KeyA":
                    Game.controls.left=false;
                    break;

                case "KeyD":
                    Game.controls.right=false;
                    break;

                case "ShiftLeft":
                    Game.controls.sprint=false;
                    break;
            }
        }
    );

    let yaw = 0;
    let pitch = 0;

    document.addEventListener(
        "mousemove",
        e => {

            if(Game.mobile) return;

            yaw -=
                e.movementX * 0.002;

            pitch -=
                e.movementY * 0.002;

            pitch =
                Math.max(
                    -1.4,
                    Math.min(
                        1.4,
                        pitch
                    )
                );

            Game.camera.rotation.set(
                pitch,
                yaw,
                0
            );
        }
    );
}

/* =====================================================
   GYROSCOPE
===================================================== */

function registerGyroscope() {

    if(!Game.mobile)
        return;

    window.addEventListener(
        "deviceorientation",
        e => {

            const beta =
                e.beta || 0;

            const gamma =
                e.gamma || 0;

            Game.camera.rotation.x =
                THREE.MathUtils.degToRad(
                    beta * 0.5
                );

            Game.camera.rotation.y =
                THREE.MathUtils.degToRad(
                    gamma * 0.5
                );
        }
    );
}

/* =====================================================
   MOVEMENT
===================================================== */

function updateMovement(delta) {

    const speed =
        Game.controls.sprint
        ? 12
        : 6;

    const forward =
        new THREE.Vector3();

    Game.camera.getWorldDirection(
        forward
    );

    forward.y = 0;
    forward.normalize();

    const right =
        new THREE.Vector3();

    right.crossVectors(
        forward,
        new THREE.Vector3(
            0,1,0
        )
    );

    if(Game.controls.forward)
        Game.camera.position.add(
            forward.multiplyScalar(
                speed*delta
            )
        );

    if(Game.controls.backward)
        Game.camera.position.add(
            forward.multiplyScalar(
                -speed*delta
            )
        );

    if(Game.controls.left)
        Game.camera.position.add(
            right.multiplyScalar(
                speed*delta
            )
        );

    if(Game.controls.right)
        Game.camera.position.add(
            right.multiplyScalar(
                -speed*delta
            )
        );
}

/* =====================================================
   RADAR
===================================================== */

function updateRadar() {

    if(
        Game.world.piggies.length===0
    ) return;

    const arrow =
        document.getElementById(
            "radarArrow"
        );

    const piggy =
        Game.world.piggies[0];

    const dir =
        piggy.position.clone()
        .sub(
            Game.camera.position
        );

    const angle =
        Math.atan2(
            dir.x,
            dir.z
        );

    arrow.style.transform =
        `translateX(-50%)
         rotate(${angle}rad)`;
}

/* =====================================================
   DAY NIGHT
===================================================== */

let timeOfDay = 0;

function updateDayNight(delta) {

    timeOfDay += delta*0.02;

    const sunHeight =
        Math.sin(timeOfDay);

    sun.position.y =
        sunHeight * 100;

    sun.intensity =
        Math.max(
            0.2,
            sunHeight + 1
        );
}

/* =====================================================
   SAVE SYSTEM
===================================================== */

function autoSave() {

    localStorage.setItem(
        "piggySave",
        JSON.stringify(
            Game.player
        )
    );
}

function loadSave() {

    const save =
        localStorage.getItem(
            "piggySave"
        );

    if(!save) return;

    Object.assign(
        Game.player,
        JSON.parse(save)
    );

    updateHUD();
}

/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        Game.camera.aspect =
            window.innerWidth /
            window.innerHeight;

        Game.camera.updateProjectionMatrix();

        Game.renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);

/* =====================================================
   LOOP
===================================================== */

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        Game.clock.getDelta();

    updateMovement(delta);

    updateRadar();

    updateDayNight(delta);

    Game.renderer.render(
        Game.scene,
        Game.camera
    );
}
if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
            .register("./sw.js")
            .then(() => {

                console.log(
                    "Service Worker Registered"
                );

            })
            .catch(console.error);
        }
    );
}
window.addEventListener(
    "beforeunload",
    () => {

        localStorage.setItem(

            "piggySave",

            JSON.stringify(
                Game.player
            )
        );
    }
);
