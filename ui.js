import { Game } from "./game.js";
import { PiggyManager } from "./piggies.js";

/* =====================================================
   UI MANAGER
===================================================== */

export const UIManager = {

    dailyRewardClaimed: false,

    achievements: [],

    init() {

        cacheElements();

        bindMenuButtons();

        setupInstallPrompt();

        setupFullscreen();

        setupDailyReward();

        loadAchievements();

        showSplash();
    }
};

/* =====================================================
   ELEMENTS
===================================================== */

let splashScreen;
let mainMenu;
let worldScreen;
let shopScreen;
let collectionScreen;
let pauseMenu;
let victoryScreen;
let installBtn;

function cacheElements(){

    splashScreen =
        document.getElementById(
            "splashScreen"
        );

    mainMenu =
        document.getElementById(
            "mainMenu"
        );

    worldScreen =
        document.getElementById(
            "worldScreen"
        );

    shopScreen =
        document.getElementById(
            "shopScreen"
        );

    collectionScreen =
        document.getElementById(
            "collectionScreen"
        );

    pauseMenu =
        document.getElementById(
            "pauseMenu"
        );

    victoryScreen =
        document.getElementById(
            "victoryScreen"
        );

    installBtn =
        document.getElementById(
            "installBtn"
        );
}

/* =====================================================
   SCREENS
===================================================== */

function hideAllScreens(){

    document
    .querySelectorAll(".screen")
    .forEach(screen => {

        screen.classList.remove(
            "active"
        );
    });
}

function openScreen(screen){

    hideAllScreens();

    screen.classList.add(
        "active"
    );
}

function showSplash(){

    openScreen(
        splashScreen
    );

    setTimeout(() => {

        openScreen(
            mainMenu
        );

    },2500);
}

/* =====================================================
   BUTTONS
===================================================== */

function bindMenuButtons(){

    document
    .getElementById("playBtn")
    ?.addEventListener(
        "click",
        startGame
    );

    document
    .getElementById("worldBtn")
    ?.addEventListener(
        "click",
        () => {

            openScreen(
                worldScreen
            );
        }
    );

    document
    .getElementById("shopBtn")
    ?.addEventListener(
        "click",
        () => {

            refreshShop();

            openScreen(
                shopScreen
            );
        }
    );

    document
    .getElementById(
        "collectionBtn"
    )?.addEventListener(
        "click",
        () => {

            refreshCollection();

            openScreen(
                collectionScreen
            );
        }
    );

    document
    .querySelectorAll(
        ".backBtn"
    ).forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                openScreen(
                    mainMenu
                );
            }
        );
    });

    document.addEventListener(
        "keydown",
        e => {

            if(
                e.key === "Escape"
            ){

                togglePause();
            }
        }
    );
}

/* =====================================================
   START GAME
===================================================== */

function startGame(){

    hideAllScreens();

    requestGyroscopePermission();

    notify(
        "Welcome Hunter!"
    );
}

/* =====================================================
   PAUSE
===================================================== */

function togglePause(){

    if(
        pauseMenu.classList.contains(
            "active"
        )
    ){

        pauseMenu.classList.remove(
            "active"
        );
    }
    else{

        pauseMenu.classList.add(
            "active"
        );
    }
}

/* =====================================================
   SHOP
===================================================== */

const ShopItems = [

{
    name:"Radar+",
    price:500
},

{
    name:"Zoom Lens",
    price:800
},

{
    name:"Night Vision",
    price:1200
},

{
    name:"Detector",
    price:2000
},

{
    name:"Speed Boost",
    price:1500
}
];

function refreshShop(){

    const grid =
        document.querySelector(
            ".shopGrid"
        );

    if(!grid) return;

    grid.innerHTML = "";

    ShopItems.forEach(item => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "shopItem";

        card.innerHTML =

        `
        <h3>${item.name}</h3>
        <p>${item.price} Coins</p>
        `;

        card.onclick =
            () => buyItem(item);

        grid.appendChild(card);
    });
}

function buyItem(item){

    if(
        Game.player.coins <
        item.price
    ){

        notify(
            "Not enough coins!"
        );

        return;
    }

    Game.player.coins -=
        item.price;

    notify(
        `${item.name} Purchased`
    );
}

/* =====================================================
   COLLECTION
===================================================== */

function refreshCollection(){

    const grid =
        document.querySelector(
            ".collectionGrid"
        );

    if(!grid) return;

    grid.innerHTML = "";

    Object.keys(
        PiggyManager.collection
    ).forEach(type => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "pigCard";

        card.innerHTML =

        `
        <h3>${type}</h3>
        <p>
        Captured:
        ${PiggyManager.collection[type]}
        </p>
        `;

        grid.appendChild(card);
    });
}

/* =====================================================
   DAILY REWARD
===================================================== */

function setupDailyReward(){

    const today =
        new Date()
        .toDateString();

    const lastClaim =
        localStorage.getItem(
            "dailyReward"
        );

    if(lastClaim === today)
        return;

    setTimeout(() => {

        Game.player.coins += 250;

        notify(
            "Daily Reward +250 Coins"
        );

        localStorage.setItem(
            "dailyReward",
            today
        );

    },3000);
}

/* =====================================================
   ACHIEVEMENTS
===================================================== */

function loadAchievements(){

    UIManager.achievements =

        JSON.parse(

            localStorage.getItem(
                "achievements"
            )

        ) || [];
}

export function unlockAchievement(
    title
){

    if(
        UIManager.achievements
        .includes(title)
    ) return;

    UIManager.achievements.push(
        title
    );

    localStorage.setItem(

        "achievements",

        JSON.stringify(
            UIManager.achievements
        )
    );

    notify(
        `🏆 ${title}`
    );
}

/* =====================================================
   VICTORY
===================================================== */

export function showVictory(
    rewardText
){

    const reward =
        document.getElementById(
            "rewardText"
        );

    if(reward)
        reward.innerHTML =
            rewardText;

    openScreen(
        victoryScreen
    );

    setTimeout(() => {

        hideAllScreens();

    },2500);
}

/* =====================================================
   RADAR
===================================================== */

export function updateRadarArrow(
    angle
){

    const arrow =
        document.getElementById(
            "radarArrow"
        );

    if(!arrow) return;

    arrow.style.transform =

        `translateX(-50%)
         rotate(${angle}rad)`;
}

/* =====================================================
   HUD
===================================================== */

export function updateHUD(){

    const coins =
        document.getElementById(
            "coins"
        );

    const gems =
        document.getElementById(
            "gems"
        );

    const level =
        document.getElementById(
            "level"
        );

    if(coins)
        coins.textContent =
            Game.player.coins;

    if(gems)
        gems.textContent =
            Game.player.gems;

    if(level)
        level.textContent =
            Game.player.level;
}

/* =====================================================
   SAVE NOTIFICATION
===================================================== */

export function savePopup(){

    notify(
        "Progress Saved"
    );
}

/* =====================================================
   TOAST
===================================================== */

function notify(message){

    const toast =
        document.createElement(
            "div"
        );

    toast.innerText =
        message;

    toast.style.cssText =

    `
    position:fixed;
    top:20px;
    right:20px;
    background:#00c6ff;
    color:white;
    padding:14px 18px;
    border-radius:12px;
    z-index:99999;
    font-weight:bold;
    box-shadow:0 0 15px cyan;
    `;

    document.body.appendChild(
        toast
    );

    setTimeout(() => {

        toast.remove();

    },3000);
}

/* =====================================================
   GYROSCOPE
===================================================== */

function requestGyroscopePermission(){

    if(
        typeof
        DeviceOrientationEvent
        === "undefined"
    )
        return;

    if(
        typeof
        DeviceOrientationEvent
        .requestPermission
        === "function"
    ){

        const btn =
            document.createElement(
                "button"
            );

        btn.innerText =
            "Enable Motion";

        btn.style.cssText =

        `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        z-index:999999;
        padding:20px;
        `;

        btn.onclick =
        async () => {

            const result =

                await
                DeviceOrientationEvent
                .requestPermission();

            if(result==="granted")
                btn.remove();
        };

        document.body
        .appendChild(btn);
    }
}

/* =====================================================
   FULLSCREEN
===================================================== */

function setupFullscreen(){

    document.addEventListener(
        "dblclick",
        () => {

            if(
                !document
                .fullscreenElement
            ){

                document
                .documentElement
                .requestFullscreen();
            }
        }
    );
}

/* =====================================================
   PWA
===================================================== */

let deferredPrompt;

function setupInstallPrompt(){

    window.addEventListener(

        "beforeinstallprompt",

        e => {

            e.preventDefault();

            deferredPrompt = e;

            installBtn.style.display =
                "block";
        }
    );

    installBtn?.addEventListener(
        "click",
        async () => {

            if(!deferredPrompt)
                return;

            deferredPrompt.prompt();

            deferredPrompt = null;

            installBtn.style.display =
                "none";
        }
    );
}

/* =====================================================
   MOBILE TOUCH
===================================================== */

export function createTouchControls(){

    if(
        !Game.mobile
    ) return;

    const joystick =
        document.createElement(
            "div"
        );

    joystick.style.cssText =

    `
    position:fixed;
    bottom:100px;
    left:20px;
    width:120px;
    height:120px;
    border-radius:50%;
    background:rgba(255,255,255,.15);
    z-index:9999;
    `;

    document.body.appendChild(
        joystick
    );
}

/* =====================================================
   AUTO UPDATE LOOP
===================================================== */

setInterval(() => {

    updateHUD();

},500);

/* =====================================================
   INIT
===================================================== */

UIManager.init();
