/**
 * 自动引入模板，在原有 sw-precache 插件默认模板基础上做的二次开发
 *
 * 因为是自定导入的模板，项目一旦生成，不支持随 sw-precache 的版本自动升级。
 * 可以到 Lavas 官网下载 basic 模板内获取最新模板进行替换
 *
 */

/* eslint-disable */

'use strict';

var precacheConfig = [["/2023/12/02/hello-world/index.html","360de0e49e327bbff1c88c0b505f4ccc"],["/2023/12/03/20231127/index.html","cfe74c3a6e2305b8ed9fa656d3b0cbcd"],["/2023/12/03/20231128/index.html","83475455d8a86249f63cb8d783d6bfe6"],["/2023/12/04/20231130/index.html","ed3a91f26de060dc536f16e2f6855966"],["/2023/12/04/20231201/index.html","5294cd639d58c7db0d57815c225691fb"],["/2023/12/04/20231202/index.html","107d2a7c59dbab2168182bf664c937d8"],["/2023/12/11/20231211/index.html","d2f0c07e8b63d25756af73db22539fa7"],["/archives/2023/12/index.html","8451c70a79e70664e0c75571a8eca7b7"],["/archives/2023/index.html","0853a3ecd2f35e6b6aa7b35d03d55664"],["/archives/index.html","44521317e810e956d87da69195e4ec0a"],["/assets/algolia_logo.svg","f309cbb84b60cd71bee3f21e7f24162e"],["/assets/beian.png","228e58cb1585de9884d77635d06eafaa"],["/assets/example_qr.png","851a661c0c87f5cf06e68dc5d603ffdb"],["/assets/loading.svg","f7d8821a9cdb993d7b3d7147d6a0447c"],["/avatar/ai.jpg","e9fbb4c99a600cd0700e51119a80d48d"],["/categories/Blog/index.html","56a281dd8ce9d907322c50a850a38915"],["/categories/摄影笔记/index.html","324352cb1a74bf9ca9f6d56c2a03ad84"],["/css/dark.css","aa0b769a810242ced50be3cbee8bfb4d"],["/css/mobile.css","43e6c80df69eabb95c02f303876393cc"],["/css/style.css","7ff68e17772be9c454d212c564c06324"],["/font/Oswald-Regular.ttf","69f4403ef57d4268b2f4dffdf9e7cfe1"],["/font/Source Sans Pro.woff","5097f81039d71344019a2ffbf6160f6c"],["/font/SourceCodePro-Regular.ttf.woff","b6ba243267725a84615cfaba137a6f55"],["/index.html","ec1b13a9b357a52bb07b05e9efceb9dd"],["/intro/404-bg.jpg","bb987c26e0a0f36f7a4350cfdfc6b4ca"],["/intro/about-bg.jpg","5c2f59e45c2d19a12cfa4e3305380e9a"],["/intro/post-bg.jpg","1fe49ae7281cb7a2883b14983883bce8"],["/lib/jquery.min.js","7c14a783dfeb3d238ccd3edd840d82ee"],["/lib/webfontloader.min.js","f0d96a202ab66fe70bbbe939b608f244"],["/pic/20231127/1.png","11d7ac07890bc81716feef2b5cd15ed0"],["/scripts/customFontLoader.js","1b37de69b62a842d6f7471ac17ffdc01"],["/scripts/dark.js","7095c76d22fbbb226d62ee206c7fd8cf"],["/scripts/main.js","265b95106901ca43ddf59714e0ddb4b7"],["/scripts/search.js","a6a7de046f150f31230310e1a0dfd03b"],["/scripts/share.js","e6a83d6657e385137cc9b6544ab3cc24"],["/sw-register.js","02cc465d58624d36dab29159888b7b88"],["/tags/431/index.html","0c2fb01da2dcb29bf8d309f41d5664ed"],["/tags/Blog/index.html","99d6c61fc8d3006d924a5ebe32b52dde"],["/tags/ICPC杭州/index.html","8b87c8d0c03485d7e1bf2b811837348c"],["/tags/人物/index.html","4c94e2efc0125160a09dce021813398c"],["/tags/国旗/index.html","73455b5ce211cdbc1eef5962cea14270"],["/tags/天空/index.html","0b9ed84ed43e0a1b4543d9243e9c9eb1"],["/tags/月亮/index.html","01ef82a283f181101e710958ae5f9dfa"],["/tags/棒球/index.html","4a43d6c1a1f81e97cbaa97c7a846b39a"],["/tags/猫/index.html","b430d92a0a58a37c2a039d60b6ecbfb7"],["/test.html","e9c7a961e1b343b9bb34d2fa30262ded"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');
var firstRegister = 1; // 默认1是首次安装SW， 0是SW更新


var ignoreUrlParametersMatching = [/^utm_/];


var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var cleanResponse = function (originalResponse) {
    // 如果没有重定向响应，不需干啥
    if (!originalResponse.redirected) {
        return Promise.resolve(originalResponse);
    }

    // Firefox 50 及以下不知处 Response.body 流, 所以我们需要读取整个body以blob形式返回。
    var bodyPromise = 'body' in originalResponse ?
        Promise.resolve(originalResponse.body) :
        originalResponse.blob();

    return bodyPromise.then(function (body) {
        // new Response() 可同时支持 stream or Blob.
        return new Response(body, {
            headers: originalResponse.headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText
        });
    });
};

var createCacheKey = function (originalUrl, paramName, paramValue,
    dontCacheBustUrlsMatching) {

    // 创建一个新的URL对象，避免影响原始URL
    var url = new URL(originalUrl);

    // 如果 dontCacheBustUrlsMatching 值没有设置，或是没有匹配到，将值拼接到url.serach后
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
        url.search += (url.search ? '&' : '') +
            encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
};

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // 如果 whitelist 是空数组，则认为全部都在白名单内
    if (whitelist.length === 0) {
        return true;
    }

    // 否则逐个匹配正则匹配并返回
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function (whitelistedPathRegex) {
        return path.match(whitelistedPathRegex);
    });
};

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // 移除 hash; 查看 https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // 是否包含 '?'
        .split('&') // 分割成数组 'key=value' 的形式
        .map(function (kv) {
            return kv.split('='); // 分割每个 'key=value' 字符串成 [key, value] 形式
        })
        .filter(function (kv) {
            return ignoreUrlParametersMatching.every(function (ignoredRegex) {
                return !ignoredRegex.test(kv[0]); // 如果 key 没有匹配到任何忽略参数正则，就 Return true
            });
        })
        .map(function (kv) {
            return kv.join('='); // 重新把 [key, value] 格式转换为 'key=value' 字符串
        })
        .join('&'); // 将所有参数 'key=value' 以 '&' 拼接

    return url.toString();
};


var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
        url.pathname += index;
    }
    return url.toString();
};

var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
    precacheConfig.map(function (item) {
        var relativeUrl = item[0];
        var hash = item[1];
        var absoluteUrl = new URL(relativeUrl, self.location);
        var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
        return [absoluteUrl.toString(), cacheKey];
    })
);

function setOfCachedUrls(cache) {
    return cache.keys().then(function (requests) {
        // 如果原cacheName中没有缓存任何收，就默认是首次安装，否则认为是SW更新
        if (requests && requests.length > 0) {
            firstRegister = 0; // SW更新
        }
        return requests.map(function (request) {
            return request.url;
        });
    }).then(function (urls) {
        return new Set(urls);
    });
}

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return setOfCachedUrls(cache).then(function (cachedUrls) {
                return Promise.all(
                    Array.from(urlsToCacheKeys.values()).map(function (cacheKey) {
                        // 如果缓存中没有匹配到cacheKey，添加进去
                        if (!cachedUrls.has(cacheKey)) {
                            var request = new Request(cacheKey, { credentials: 'same-origin' });
                            return fetch(request).then(function (response) {
                                // 只要返回200才能继续，否则直接抛错
                                if (!response.ok) {
                                    throw new Error('Request for ' + cacheKey + ' returned a ' +
                                        'response with status ' + response.status);
                                }

                                return cleanResponse(response).then(function (responseToCache) {
                                    return cache.put(cacheKey, responseToCache);
                                });
                            });
                        }
                    })
                );
            });
        })
            .then(function () {
            
            // 强制 SW 状态 installing -> activate
            return self.skipWaiting();
            
        })
    );
});

self.addEventListener('activate', function (event) {
    var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.keys().then(function (existingRequests) {
                return Promise.all(
                    existingRequests.map(function (existingRequest) {
                        // 删除原缓存中相同键值内容
                        if (!setOfExpectedUrls.has(existingRequest.url)) {
                            return cache.delete(existingRequest);
                        }
                    })
                );
            });
        }).then(function () {
            
            return self.clients.claim();
            
        }).then(function () {
                // 如果是首次安装 SW 时, 不发送更新消息（是否是首次安装，通过指定cacheName 中是否有缓存信息判断）
                // 如果不是首次安装，则是内容有更新，需要通知页面重载更新
                if (!firstRegister) {
                    return self.clients.matchAll()
                        .then(function (clients) {
                            if (clients && clients.length) {
                                clients.forEach(function (client) {
                                    client.postMessage('sw.update');
                                })
                            }
                        })
                }
            })
    );
});



    self.addEventListener('fetch', function (event) {
        if (event.request.method === 'GET') {

            // 是否应该 event.respondWith()，需要我们逐步的判断
            // 而且也方便了后期做特殊的特殊
            var shouldRespond;


            // 首先去除已配置的忽略参数及hash
            // 查看缓存简直中是否包含该请求，包含就将shouldRespond 设为true
            var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
            shouldRespond = urlsToCacheKeys.has(url);

            // 如果 shouldRespond 是 false, 我们在url后默认增加 'index.html'
            // (或者是你在配置文件中自行配置的 directoryIndex 参数值)，继续查找缓存列表
            var directoryIndex = 'index.html';
            if (!shouldRespond && directoryIndex) {
                url = addDirectoryIndex(url, directoryIndex);
                shouldRespond = urlsToCacheKeys.has(url);
            }

            // 如果 shouldRespond 仍是 false，检查是否是navigation
            // request， 如果是的话，判断是否能与 navigateFallbackWhitelist 正则列表匹配
            var navigateFallback = '';
            if (!shouldRespond &&
                navigateFallback &&
                (event.request.mode === 'navigate') &&
                isPathWhitelisted([], event.request.url)
            ) {
                url = new URL(navigateFallback, self.location).toString();
                shouldRespond = urlsToCacheKeys.has(url);
            }

            // 如果 shouldRespond 被置为 true
            // 则 event.respondWith()匹配缓存返回结果，匹配不成就直接请求.
            if (shouldRespond) {
                event.respondWith(
                    caches.open(cacheName).then(function (cache) {
                        return cache.match(urlsToCacheKeys.get(url)).then(function (response) {
                            if (response) {
                                return response;
                            }
                            throw Error('The cached response that was expected is missing.');
                        });
                    }).catch(function (e) {
                        // 如果捕获到异常错误，直接返回 fetch() 请求资源
                        console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
                        return fetch(event.request);
                    })
                );
            }
        }
    });









/* eslint-enable */
