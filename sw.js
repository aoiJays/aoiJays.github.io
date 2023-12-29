/**
 * 自动引入模板，在原有 sw-precache 插件默认模板基础上做的二次开发
 *
 * 因为是自定导入的模板，项目一旦生成，不支持随 sw-precache 的版本自动升级。
 * 可以到 Lavas 官网下载 basic 模板内获取最新模板进行替换
 *
 */

/* eslint-disable */

'use strict';

var precacheConfig = [["/2023/12/02/hello-world/index.html","17f48a4432c3f9af740c633c80472e64"],["/2023/12/03/20231127/index.html","5d5728414014418d8bed143181922f0e"],["/2023/12/03/20231128/index.html","d749826de478c31b73aa9c0a149c55f2"],["/2023/12/04/20231130/index.html","a44501af175aa291ccac1b848d1e13f1"],["/2023/12/04/20231201/index.html","9bbcc49c9af179a125645f913489c2a2"],["/2023/12/04/20231202/index.html","a4b02844958e6da87595b068ffa2d8f3"],["/2023/12/11/20231211/index.html","64d01ff43b13d66ee1cf4717472c6c7e"],["/2023/12/29/20231229/index.html","1dfb0dad19f19007e3acf24a4ecd886e"],["/archives/2023/12/index.html","55d95b223774c5c7e33b13e6fa6b6172"],["/archives/2023/index.html","729ab3ed3dacaaf4aa726300dc2b8618"],["/archives/index.html","c9d23a7a453f37667e3b9d3d7d3dd6bb"],["/assets/algolia_logo.svg","f309cbb84b60cd71bee3f21e7f24162e"],["/assets/beian.png","228e58cb1585de9884d77635d06eafaa"],["/assets/example_qr.png","851a661c0c87f5cf06e68dc5d603ffdb"],["/assets/loading.svg","f7d8821a9cdb993d7b3d7147d6a0447c"],["/avatar/ai.jpg","e9fbb4c99a600cd0700e51119a80d48d"],["/categories/Blog/index.html","65828a81dfcb1cbe122a162628bbecab"],["/categories/摄影笔记/index.html","db97a677dcc25a5b17f39324bc02f544"],["/css/dark.css","aa0b769a810242ced50be3cbee8bfb4d"],["/css/mobile.css","43e6c80df69eabb95c02f303876393cc"],["/css/style.css","7ff68e17772be9c454d212c564c06324"],["/font/Oswald-Regular.ttf","69f4403ef57d4268b2f4dffdf9e7cfe1"],["/font/Source Sans Pro.woff","5097f81039d71344019a2ffbf6160f6c"],["/font/SourceCodePro-Regular.ttf.woff","b6ba243267725a84615cfaba137a6f55"],["/index.html","e14423d3a878131e824ae4cdd79ae087"],["/intro/404-bg.jpg","bb987c26e0a0f36f7a4350cfdfc6b4ca"],["/intro/about-bg.jpg","5c2f59e45c2d19a12cfa4e3305380e9a"],["/intro/post-bg.jpg","1fe49ae7281cb7a2883b14983883bce8"],["/lib/jquery.min.js","7c14a783dfeb3d238ccd3edd840d82ee"],["/lib/webfontloader.min.js","f0d96a202ab66fe70bbbe939b608f244"],["/pic/20231127/1.png","11d7ac07890bc81716feef2b5cd15ed0"],["/scripts/customFontLoader.js","1b37de69b62a842d6f7471ac17ffdc01"],["/scripts/dark.js","7095c76d22fbbb226d62ee206c7fd8cf"],["/scripts/main.js","265b95106901ca43ddf59714e0ddb4b7"],["/scripts/search.js","a6a7de046f150f31230310e1a0dfd03b"],["/scripts/share.js","e6a83d6657e385137cc9b6544ab3cc24"],["/sw-register.js","0f8fb88ac2b61a25aec08b8727bf1490"],["/tags/431/index.html","4a59c24e0a32d5c14d07671f2213c955"],["/tags/Blog/index.html","65197122e033dd77b0c399cc94e71240"],["/tags/ICPC杭州/index.html","78d2d5d9499f9067b517666dbd46f288"],["/tags/人物/index.html","b26663f3fe59a83ea1353b53401726b8"],["/tags/国旗/index.html","0148cf304c2aaa34c04ffd38b462998f"],["/tags/天空/index.html","06254b9d1941a96313035218a530818f"],["/tags/故宫/index.html","1e7a04704b5b20cb57fb49e388326d17"],["/tags/月亮/index.html","e2213857b9f5d2ecf9a2dce02ae11f2d"],["/tags/棒球/index.html","eb1fecdf363c9ab443a651fc3cf04720"],["/tags/猫/index.html","dff140634492ed2045a3faf904d70bbd"],["/tags/百度之星/index.html","66f3edf770ceb3eadf556efb805020d9"],["/test.html","09a805d5c4f38a4775fa9d3775e2af99"]];
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
