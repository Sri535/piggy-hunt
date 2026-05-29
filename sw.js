const CACHE_NAME =
"piggy-hunt-v1";

const ASSETS = [

"/",
"/index.html",
"/style.css",
"/game.js",
"/worlds.js",
"/piggies.js",
"/ui.js",

"/manifest.json",

"/assets/icons/icon-192.png",
"/assets/icons/icon-512.png"
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
