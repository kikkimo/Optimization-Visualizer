const CACHE_NAME = 'optimization-presentation-v2'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/vite.svg'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened')
        // 只缓存关键的静态资源，其他资源在fetch时动态缓存
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Service Worker: Cache addAll failed, continuing...', error)
          // 即使某些资源缓存失败也继续安装
        })
      })
  )
})

self.addEventListener('fetch', (event) => {
  // 跳过非http/https请求（如chrome-extension等）
  if (!event.request.url.startsWith('http')) {
    return
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        
        const fetchRequest = event.request.clone()
        
        return fetch(fetchRequest).then(
          (response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          }
        ).catch(() => {
          if (event.request.destination === 'document') {
            return caches.match('/index.html')
          }
        })
      })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache')
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})