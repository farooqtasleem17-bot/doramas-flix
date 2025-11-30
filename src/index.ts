import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['*'],
  exposeHeaders: ['*'],
  maxAge: 86400,
}))

const EXCLUDED_HEADERS = [
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'cf-connecting-ip',
  'cf-ray',
  'cf-visitor',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-real-ip',
]

// GET REQ
app.get('/', async (c) => {
  const encodedUrl = c.req.query('url')
  if (!encodedUrl) {
    return c.text('Missing url parameter', 400)
  }

  try {
    const decodedUrl = atob(encodedUrl)

    // Parse headers from query parameter if provided
    const headersParam = c.req.query('headers')
    const headersToForward = new Headers()

    if (headersParam) {
      try {
        const headersJson = JSON.parse(atob(headersParam))
        for (const [key, value] of Object.entries(headersJson)) {
          const lowerKey = key.toLowerCase()
          if (!EXCLUDED_HEADERS.includes(lowerKey)) {
            headersToForward.set(key, value as string)
          }
        }
      } catch (e) {
        return c.text('Invalid headers parameter', 400)
      }
    }

    // Ensure we have a User-Agent
    if (!headersToForward.has('User-Agent')) {
      headersToForward.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    }

    const response = await fetch(decodedUrl, {
      headers: headersToForward,
      redirect: 'follow',
    })

    // Create response headers, excluding Cloudflare-specific headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!lowerKey.startsWith('cf-') && !EXCLUDED_HEADERS.includes(lowerKey)) {
        responseHeaders.set(key, value)
      }
    })

    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return c.text(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
  }
})

// POST REQ
app.post('/', async (c) => {
  const encodedUrl = c.req.query('url')
  if (!encodedUrl) {
    return c.text('Missing url parameter', 400)
  }

  try {
    const decodedUrl = atob(encodedUrl)
    const body = await c.req.text()

    // Parse headers from query parameter if provided
    const headersParam = c.req.query('headers')
    const headersToForward = new Headers()

    if (headersParam) {
      try {
        const headersJson = JSON.parse(atob(headersParam))
        for (const [key, value] of Object.entries(headersJson)) {
          const lowerKey = key.toLowerCase()
          if (!EXCLUDED_HEADERS.includes(lowerKey)) {
            headersToForward.set(key, value as string)
          }
        }
      } catch (e) {
        return c.text('Invalid headers parameter', 400)
      }
    }

    // Ensure we have a User-Agent
    if (!headersToForward.has('User-Agent')) {
      headersToForward.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')
    }

    // Ensure Content-Length is set correctly
    if (body) {
      headersToForward.set('Content-Length', body.length.toString())
    }

    const response = await fetch(decodedUrl, {
      method: 'POST',
      headers: headersToForward,
      body: body,
      redirect: 'follow',
    })

    // Create response headers, excluding Cloudflare-specific headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (!lowerKey.startsWith('cf-') && !EXCLUDED_HEADERS.includes(lowerKey)) {
        responseHeaders.set(key, value)
      }
    })

    // Add CORS headers
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', '*')

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return c.text(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
  }
})

export default app
