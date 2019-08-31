addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

const API_KEY = `yourApiKey`
const API_URL = `http://www.omdbapi.com`

// if you want to fetch a single movie.
// const getSingleMovieUrl = movieId =>
//   `http://www.omdbapi.com/?i=${movieId}&apiKey=${API_KEY}`

const getSearchUrl = (searchTerm, page = 1) =>
  `http://www.omdbapi.com/?s=${searchTerm}&page=${page}&apiKey=${API_KEY}`

async function fetchApi(event) {
  const url = new URL(event.request.url)
  const uri = url.pathname.split('/')
  const page = url.searchParams.get('page')
  let urlToFetch = `https://movie-app-workers.jgb.solutions/`

  // if you want to fetch a single movie.
  // if (uri[1] === `movie`) urlToFetch = getSingleMovieUrl(uri[2])
  if (uri[1] === `search`) urlToFetch = getSearchUrl(uri[2], page)

  const cache = caches.default
  let response = await cache.match(event.request)

  if (!response) {
    response = await fetch(urlToFetch, { cf: { cacheEverything: true } })
    // const headers = { 'cache-control': 'public, max-age=31536000' }
    // response = new Response(response.body, { ...response, headers })
    event.waitUntil(cache.put(event.request, response.clone()))
  }
  return response
}

async function handleRequest(event) {
  if (event.request.method === 'GET') {
    let response = await fetchApi(event)
    if (response.status > 399) {
      response = new Response(response.statusText, { status: response.status })
    }
    return response
  } else {
    return new Response('Method not allowed', { status: 405 })
  }
}
