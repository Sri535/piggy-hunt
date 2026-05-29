const CACHE_NAME =
"piggy-hunt-v1";
const BASE = 
"/piggy-hunt/"
const ASSETS = [

BASE,
BASE + "index.html",
BASE + "style.css",
BASE + "game.js",
BASE + "worlds.js",
BASE + "piggies.js",
BASE + "ui.js",
BASE + "manifest.json"
];

/* ======================================
   INSTALL
====================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(cache => {

                return cache.addAll(
                    ASSETS
                );
            })
        );

        self.skipWaiting();
    }
);

/* ======================================
   ACTIVATE
====================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(
                            key !== CACHE_NAME
                        ){

                            return caches.delete(
                                key
                            );
                        }

                    })
                );
            })
        );

        self.clients.claim();
    }
);

/* ======================================
   FETCH
====================================== */

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )

            .then(response => {

                return (
                    response ||

                    fetch(
                        event.request
                    )
                    .then(network => {

                        const copy =
                            network.clone();

                        caches.open(
                            CACHE_NAME
                        )
                        .then(cache => {

                            cache.put(
                                event.request,
                                copy
                            );
                        });

                        return network;
                    })
                );
            })
        );
    }
);
