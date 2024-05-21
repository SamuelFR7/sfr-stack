import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { safeRedirect } from "remix-utils/safe-redirect"

import { env } from "./env"
import { combineResponseInits } from "./misc"
import { Session } from "./db/schema"

const secret = env.COOKIE_SECRET

const isProduction = env.NODE_ENV === "production"

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [secret],
    ...(isProduction
      ? { domain: "your-production-domain.com", secure: true }
      : {}),
  },
})

export async function handleNewSession(
  {
    request,
    session,
    redirectTo = "/",
  }: {
    request: Request
    session: Session
    redirectTo?: string
  },
  responseInit?: ResponseInit
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  )

  authSession.set("sessionId", session.id)

  return redirect(
    safeRedirect(redirectTo),
    combineResponseInits(
      {
        headers: {
          "Set-Cookie": await authSessionStorage.commitSession(authSession, {
            expires: session.expiresAt,
          }),
        },
      },
      responseInit
    )
  )
}
