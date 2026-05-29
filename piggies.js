import * as THREE from "three";
import { Game } from "./game.js";

/* =====================================================
   PIGGY MANAGER
===================================================== */

export const PiggyManager = {

    piggies: [],

    bossPiggy: null,

    spawnTimer: 0,

    bossTimer: 0,

    collection: {},

    init() {

        loadCollection();

        spawnStarterPiggies();

        startBossEvent();
    },

    update(delta) {

        animatePiggies(delta);

        updateGhostPiggies(delta);

        updateDragonPiggies(delta);

        this.spawnTimer += delta;

        this.bossTimer += delta;

        if(this.spawnTimer > 25){

            spawnRandomPiggy();

            this.spawnTimer = 0;
        }

        if(this.bossTimer > 180){

            spawnBossPiggy();

            this.bossTimer = 0;
        }
    }
};

/* =====================================================
   TYPES
===================================================== */

export const PiggyTypes = {

    COMMON: "common",

    GOLDEN: "golden",

    RAINBOW: "rainbow",

    GHOST: "ghost",

    DRAGON: "dragon",

    BOSS: "boss"
};

/* =====================================================
   CREATE PIGGY
===================================================== */

export function createPiggy(type) {

    const piggy =
        new THREE.Group();

    let color = 0xffa3d7;

    switch(type){

        case PiggyTypes.GOLDEN:
            color = 0xffd700;
            break;

        case PiggyTypes.RAINBOW:
            color = 0xffffff;
            break;

        case PiggyTypes.GHOST:
            color = 0xddeeff;
            break;

        case PiggyTypes.DRAGON:
            color = 0x00ff99;
            break;

        case PiggyTypes.BOSS:
            color = 0xff3300;
            break;
    }

    const body =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                type === PiggyTypes.BOSS
                ? 3
                : 1.3,
                24,
                24
            ),

            new THREE.MeshStandardMaterial({

                color,

                transparent:
                    type === PiggyTypes.GHOST,

                opacity:
                    type === PiggyTypes.GHOST
                    ? 0.5
                    : 1,

                emissive:
                    type === PiggyTypes.GOLDEN
                    ? 0xffcc00
                    : 0x000000
            })
        );

    piggy.add(body);

    piggy.position.set(

        randomRange(-250,250),

        type === PiggyTypes.DRAGON
        ? randomRange(15,40)
        : 1.5,

        randomRange(-250,250)
    );

    piggy.userData = {

        type,

        body,

        angle: Math.random()*100,

        captured: false,

        health:
            type === PiggyTypes.BOSS
            ? 20
            : 1
    };

    Game.scene.add(piggy);

    PiggyManager.piggies.push(
        piggy
    );

    return piggy;
}

/* =====================================================
   STARTER SPAWNS
===================================================== */

function spawnStarterPiggies(){

    for(let i=0;i<25;i++)
        createPiggy(
            PiggyTypes.COMMON
        );

    for(let i=0;i<8;i++)
        createPiggy(
            PiggyTypes.GOLDEN
        );

    for(let i=0;i<4;i++)
        createPiggy(
            PiggyTypes.RAINBOW
        );

    for(let i=0;i<2;i++)
        createPiggy(
            PiggyTypes.GHOST
        );

    createPiggy(
        PiggyTypes.DRAGON
    );
}

/* =====================================================
   RANDOM SPAWNER
===================================================== */

function spawnRandomPiggy(){

    const roll =
        Math.random();

    if(roll < 0.65){

        createPiggy(
            PiggyTypes.COMMON
        );
    }
    else if(roll < 0.85){

        createPiggy(
            PiggyTypes.GOLDEN
        );
    }
    else if(roll < 0.95){

        createPiggy(
            PiggyTypes.RAINBOW
        );
    }
    else if(roll < 0.99){

        createPiggy(
            PiggyTypes.GHOST
        );
    }
    else{

        createPiggy(
            PiggyTypes.DRAGON
        );
    }
}

/* =====================================================
   BOSS EVENT
===================================================== */

function startBossEvent(){

    console.log(
        "Boss Event Active"
    );
}

function spawnBossPiggy(){

    if(PiggyManager.bossPiggy)
        return;

    const boss =
        createPiggy(
            PiggyTypes.BOSS
        );

    boss.position.set(
        0,
        4,
        -80
    );

    PiggyManager.bossPiggy =
        boss;

    console.log(
        "Boss Piggy Appeared!"
    );
}

/* =====================================================
   ANIMATION
===================================================== */

function animatePiggies(delta){

    const time =
        performance.now() * 0.001;

    PiggyManager.piggies.forEach(
        piggy => {

            piggy.userData.angle +=
                delta;

            piggy.position.y +=
                Math.sin(
                    time +
                    piggy.userData.angle
                ) * 0.01;

            piggy.rotation.y +=
                delta * 0.8;

            switch(
                piggy.userData.type
            ){

                case PiggyTypes.RAINBOW:

                    piggy.userData.body
                    .material.color
                    .setHSL(

                        (time*0.2)%1,

                        1,

                        0.5
                    );

                    break;

                case PiggyTypes.GOLDEN:

                    piggy.userData.body
                    .material.emissiveIntensity =

                        1 +
                        Math.sin(time*4)*0.5;

                    break;
            }
        }
    );
}

/* =====================================================
   GHOST AI
===================================================== */

function updateGhostPiggies(){

    const time =
        performance.now()*0.001;

    PiggyManager.piggies.forEach(
        piggy => {

            if(
                piggy.userData.type !==
                PiggyTypes.GHOST
            )
                return;

            piggy.visible =
                Math.sin(time*2) > -0.2;
        }
    );
}

/* =====================================================
   DRAGON AI
===================================================== */

function updateDragonPiggies(delta){

    PiggyManager.piggies.forEach(
        piggy => {

            if(
                piggy.userData.type !==
                PiggyTypes.DRAGON
            )
                return;

            piggy.position.x +=
                Math.sin(
                    performance.now()*0.0005
                ) * delta * 20;

            piggy.position.z +=
                Math.cos(
                    performance.now()*0.0005
                ) * delta * 20;

            piggy.position.y =
                20 +
                Math.sin(
                    performance.now()*0.002
                ) * 5;
        }
    );
}

/* =====================================================
   CAPTURE
===================================================== */

export function capturePiggy(
    piggy
){

    if(
        !piggy ||
        piggy.userData.captured
    )
        return;

    piggy.userData.captured = true;

    const type =
        piggy.userData.type;

    const reward =
        calculateReward(type);

    Game.player.coins +=
        reward.coins;

    Game.player.xp +=
        reward.xp;

    addCollection(type);

    createCaptureEffect(
        piggy.position
    );

    Game.scene.remove(
        piggy
    );

    PiggyManager.piggies =
        PiggyManager.piggies.filter(
            p => p !== piggy
        );

    updateRewardUI(
        reward
    );
}

/* =====================================================
   REWARDS
===================================================== */

function calculateReward(type){

    switch(type){

        case PiggyTypes.COMMON:

            return {
                coins:10,
                xp:10
            };

        case PiggyTypes.GOLDEN:

            return {
                coins:50,
                xp:50
            };

        case PiggyTypes.RAINBOW:

            return {
                coins:100,
                xp:100
            };

        case PiggyTypes.GHOST:

            return {
                coins:200,
                xp:200
            };

        case PiggyTypes.DRAGON:

            return {
                coins:1000,
                xp:1000
            };

        case PiggyTypes.BOSS:

            return {
                coins:5000,
                xp:5000
            };
    }
}

/* =====================================================
   COLLECTION
===================================================== */

function addCollection(type){

    if(
        !PiggyManager.collection[type]
    ){
        PiggyManager.collection[type]=0;
    }

    PiggyManager.collection[type]++;

    localStorage.setItem(

        "piggyCollection",

        JSON.stringify(
            PiggyManager.collection
        )
    );
}

function loadCollection(){

    const save =
        localStorage.getItem(
            "piggyCollection"
        );

    if(save){

        PiggyManager.collection =
            JSON.parse(save);
    }
}

/* =====================================================
   EFFECTS
===================================================== */

function createCaptureEffect(
    position
){

    const particles = [];

    for(let i=0;i<100;i++){

        particles.push(

            position.x,

            position.y,

            position.z
        );
    }

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(

        "position",

        new THREE.Float32BufferAttribute(
            particles,
            3
        )
    );

    const effect =
        new THREE.Points(

            geometry,

            new THREE.PointsMaterial({

                color:0xffff00,

                size:2
            })
        );

    Game.scene.add(effect);

    setTimeout(
        () => {

            Game.scene.remove(
                effect
            );

        },
        1500
    );
}

/* =====================================================
   UI
===================================================== */

function updateRewardUI(
    reward
){

    const rewardText =
        document.getElementById(
            "rewardText"
        );

    if(!rewardText)
        return;

    rewardText.innerHTML =

        `+${reward.coins} Coins
         <br>
         +${reward.xp} XP`;
}

/* =====================================================
   HELPERS
===================================================== */

function randomRange(min,max){

    return Math.random() *
           (max-min) + min;
}

/* =====================================================
   INITIALIZE
===================================================== */

PiggyManager.init();
