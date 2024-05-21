import { createRequestHandler } from "@remix-run/express"
import { installGlobals } from "@remix-run/node"
import compression from "compression"
import express from "express"
import rateLimit from "express-rate-limit"
import morgan from "morgan"

installGlobals()

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      )

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
})

const app = express()

const getHost = (req) => req.get("X-Forwarded-Host") ?? req.get("host") ?? ""

// fly is our proxy
app.set("trust proxy", true)

app.use((req, res, next) => {
  const proto = req.get("X-Forwarded-Proto")
  const host = getHost(req)
  if (proto === "http") {
    res.set("X-Forwarded-Proto", "https")
    res.redirect(`https://${host}${req.originalUrl}`)
    return
  }
  next()
})

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by")

// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  )
}

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("build/client", { maxAge: "1h" }))

app.use(morgan("tiny"))

const maxMultiple = process.env.NODE_ENV !== "production" ? 10_000 : 1

const rateLimitDefault = {
  windowMs: 60 * 1000,
  limit: 1000 * maxMultiple,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
}

const strongRateLimit = rateLimit({
  ...rateLimitDefault,
  windowMs: 60 * 1000,
  limit: 100 * maxMultiple,
})

const strongestRateLimit = rateLimit({
  ...rateLimitDefault,
  windowMs: 60 * 1000,
  limit: 10 * maxMultiple,
})

const generalRateLimit = rateLimit(rateLimitDefault)

app.use((req, res, next) => {
  const strongPaths = ["/auth/sign-in", "/auth/logout"]

  if (req.method !== "GET" && req.method !== "HEAD") {
    if (strongPaths.some((p) => req.path.includes(p)) || req.path === "/") {
      return strongestRateLimit(req, res, next)
    }

    return strongRateLimit(req, res, next)
  }

  return generalRateLimit(req, res, next)
})

// handle SSR requests
app.all("*", remixHandler)

const port = process.env.PORT || 3000
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`)
)
