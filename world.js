import * as THREE from "three";
import { Game } from "./game.js";

/* =====================================================
   WORLD MANAGER
===================================================== */

export const WorldManager = {

    currentWorld: null,

    weather: null,

    particleSystems: [],

    init() {

        this.attachWorldButtons();

        this.loadWorld("forest");
    },

    loadWorld(worldName) {

        this.clearEnvironment();

        switch(worldName) {

            case "forest":
                createForest();
                break;

            case "island":
                createIsland();
                break;

            case "snow":
                createSnowWorld();
                break;

            case "volcano":
                createVolcanoWorld();
                break;

            case "space":
                createSpaceWorld();
                break;
        }

        Game.world.current = worldName;

        console.log(
            "Loaded World:",
            worldName
        );
    },

    clearEnvironment() {

        const keep = [];

        Game.scene.children.forEach(obj => {

            if(
                obj.type === "PerspectiveCamera" ||
                obj.type.includes("Light")
            ){
                keep.push(obj);
            }

        });

        while(Game.scene.children.length > 0){

            Game.scene.remove(
                Game.scene.children[0]
            );
        }

        keep.forEach(obj =>
            Game.scene.add(obj)
        );

        this.particleSystems = [];
    },

    attachWorldButtons() {

        const cards =
            document.querySelectorAll(
                ".worldCard"
            );

        cards.forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    if(
                        card.classList.contains("forest")
                    )
                        this.loadWorld("forest");

                    if(
                        card.classList.contains("island")
                    )
                        this.loadWorld("island");

                    if(
                        card.classList.contains("snow")
                    )
                        this.loadWorld("snow");

                    if(
                        card.classList.contains("volcano")
                    )
                        this.loadWorld("volcano");

                    if(
                        card.classList.contains("space")
                    )
                        this.loadWorld("space");
                }
            );
        });
    }
};

/* =====================================================
   FOREST
===================================================== */

function createForest() {

    Game.scene.background =
        new THREE.Color(0x9fd6ff);

    createGround(0x3d8f3d);

    for(let i=0;i<200;i++){

        const tree =
            createTree();

        tree.position.set(
            randomRange(-250,250),
            0,
            randomRange(-250,250)
        );

        Game.scene.add(tree);
    }

    createFireflies();

    createFog(
        0xb8ffd1,
        0.002
    );
}

/* =====================================================
   ISLAND
===================================================== */

function createIsland() {

    Game.scene.background =
        new THREE.Color(0x7dd3ff);

    createGround(0xd9c38f);

    createOcean();

    for(let i=0;i<80;i++){

        const palm =
            createPalmTree();

        palm.position.set(
            randomRange(-200,200),
            0,
            randomRange(-200,200)
        );

        Game.scene.add(palm);
    }
}

/* =====================================================
   SNOW WORLD
===================================================== */

function createSnowWorld() {

    Game.scene.background =
        new THREE.Color(0xeaf7ff);

    createGround(0xffffff);

    createSnowParticles();

    createFrozenLake();
}

/* =====================================================
   VOLCANO WORLD
===================================================== */

function createVolcanoWorld() {

    Game.scene.background =
        new THREE.Color(0x1a0000);

    createGround(0x2b2b2b);

    createLavaRiver();

    createSmoke();

    createEmbers();
}

/* =====================================================
   SPACE WORLD
===================================================== */

function createSpaceWorld() {

    Game.scene.background =
        new THREE.Color(0x020014);

    createSpaceSky();

    createFloatingIslands();

    createAsteroids();
}

/* =====================================================
   GROUND
===================================================== */

function createGround(color) {

    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                1000,
                1000
            ),

            new THREE.MeshStandardMaterial({
                color
            })
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    Game.scene.add(ground);
}

/* =====================================================
   TREE
===================================================== */

function createTree() {

    const tree =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.5,
                0.8,
                5
            ),

            new THREE.MeshStandardMaterial({
                color:0x7a4f25
            })
        );

    trunk.position.y = 2.5;

    tree.add(trunk);

    const leaves =
        new THREE.Mesh(

            new THREE.ConeGeometry(
                3,
                8,
                8
            ),

            new THREE.MeshStandardMaterial({
                color:0x1fa31f
            })
        );

    leaves.position.y = 8;

    tree.add(leaves);

    return tree;
}

/* =====================================================
   PALM TREE
===================================================== */

function createPalmTree() {

    const palm =
        new THREE.Group();

    const trunk =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.3,
                0.6,
                7
            ),

            new THREE.MeshStandardMaterial({
                color:0x8d5a2b
            })
        );

    trunk.position.y = 3.5;

    palm.add(trunk);

    for(let i=0;i<6;i++){

        const leaf =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    4,
                    0.2,
                    0.5
                ),

                new THREE.MeshStandardMaterial({
                    color:0x2ecb65
                })
            );

        leaf.position.y = 7;

        leaf.rotation.y =
            i * Math.PI/3;

        palm.add(leaf);
    }

    return palm;
}

/* =====================================================
   OCEAN
===================================================== */

function createOcean() {

    const water =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                450,
                64
            ),

            new THREE.MeshStandardMaterial({

                color:0x00bfff,

                transparent:true,

                opacity:0.8
            })
        );

    water.rotation.x =
        -Math.PI/2;

    water.position.y = 0.1;

    Game.scene.add(water);
}

/* =====================================================
   SNOW PARTICLES
===================================================== */

function createSnowParticles() {

    const geometry =
        new THREE.BufferGeometry();

    const particles = [];

    for(let i=0;i<4000;i++){

        particles.push(
            randomRange(-300,300),
            Math.random()*150,
            randomRange(-300,300)
        );
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            particles,
            3
        )
    );

    const points =
        new THREE.Points(

            geometry,

            new THREE.PointsMaterial({

                color:0xffffff,

                size:1.5
            })
        );

    Game.scene.add(points);

    WorldManager.particleSystems.push(
        points
    );
}

/* =====================================================
   FROZEN LAKE
===================================================== */

function createFrozenLake() {

    const lake =
        new THREE.Mesh(

            new THREE.CircleGeometry(
                80,
                64
            ),

            new THREE.MeshPhysicalMaterial({

                color:0xaee8ff,

                transparent:true,

                opacity:0.85,

                roughness:0.1
            })
        );

    lake.rotation.x =
        -Math.PI/2;

    lake.position.y = 0.05;

    Game.scene.add(lake);
}

/* =====================================================
   LAVA
===================================================== */

function createLavaRiver() {

    const lava =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                30,
                0.2,
                800
            ),

            new THREE.MeshStandardMaterial({

                color:0xff4500,

                emissive:0xff2200,

                emissiveIntensity:3
            })
        );

    lava.position.y = 0.1;

    Game.scene.add(lava);
}

/* =====================================================
   SMOKE
===================================================== */

function createSmoke() {

    for(let i=0;i<100;i++){

        const smoke =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    Math.random()*4
                ),

                new THREE.MeshBasicMaterial({

                    color:0x444444,

                    transparent:true,

                    opacity:0.4
                })
            );

        smoke.position.set(
            randomRange(-80,80),
            randomRange(5,50),
            randomRange(-80,80)
        );

        Game.scene.add(smoke);
    }
}

/* =====================================================
   EMBERS
===================================================== */

function createEmbers() {

    const points = [];

    for(let i=0;i<1500;i++){

        points.push(
            randomRange(-250,250),
            Math.random()*100,
            randomRange(-250,250)
        );
    }

    const geo =
        new THREE.BufferGeometry();

    geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            points,
            3
        )
    );

    const ember =
        new THREE.Points(

            geo,

            new THREE.PointsMaterial({

                color:0xff6600,

                size:2
            })
        );

    Game.scene.add(ember);
}

/* =====================================================
   SPACE SKY
===================================================== */

function createSpaceSky() {

    const stars = [];

    for(let i=0;i<10000;i++){

        stars.push(
            randomRange(-1000,1000),
            randomRange(-1000,1000),
            randomRange(-1000,1000)
        );
    }

    const geo =
        new THREE.BufferGeometry();

    geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            stars,
            3
        )
    );

    const starField =
        new THREE.Points(

            geo,

            new THREE.PointsMaterial({

                color:0xffffff,

                size:2
            })
        );

    Game.scene.add(starField);
}

/* =====================================================
   FLOATING ISLANDS
===================================================== */

function createFloatingIslands() {

    for(let i=0;i<20;i++){

        const island =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    randomRange(15,40),
                    randomRange(8,20),
                    randomRange(15,40)
                ),

                new THREE.MeshStandardMaterial({

                    color:0x555555
                })
            );

        island.position.set(

            randomRange(-250,250),

            randomRange(30,100),

            randomRange(-250,250)
        );

        Game.scene.add(island);
    }
}

/* =====================================================
   ASTEROIDS
===================================================== */

function createAsteroids() {

    for(let i=0;i<80;i++){

        const asteroid =
            new THREE.Mesh(

                new THREE.DodecahedronGeometry(
                    randomRange(2,8)
                ),

                new THREE.MeshStandardMaterial({

                    color:0x666666
                })
            );

        asteroid.position.set(

            randomRange(-500,500),

            randomRange(20,200),

            randomRange(-500,500)
        );

        Game.scene.add(asteroid);
    }
}

/* =====================================================
   FIREFLIES
===================================================== */

function createFireflies() {

    const particles = [];

    for(let i=0;i<1200;i++){

        particles.push(
            randomRange(-300,300),
            randomRange(1,30),
            randomRange(-300,300)
        );
    }

    const geo =
        new THREE.BufferGeometry();

    geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            particles,
            3
        )
    );

    const fireflies =
        new THREE.Points(

            geo,

            new THREE.PointsMaterial({

                color:0xffff66,

                size:1.5
            })
        );

    Game.scene.add(fireflies);
}

/* =====================================================
   FOG
===================================================== */

function createFog(color,density){

    Game.scene.fog =
        new THREE.FogExp2(
            color,
            density
        );
}

/* =====================================================
   WEATHER SYSTEM
===================================================== */

export function setWeather(type){

    switch(type){

        case "rain":
            console.log("Rain Enabled");
            break;

        case "snow":
            console.log("Snow Enabled");
            break;

        case "storm":
            console.log("Thunderstorm Enabled");
            break;

        case "clear":
            console.log("Clear Weather");
            break;
    }
}

/* =====================================================
   HELPERS
===================================================== */

function randomRange(min,max){

    return Math.random() *
           (max-min) + min;
}

/* =====================================================
   START
===================================================== */

WorldManager.init();
