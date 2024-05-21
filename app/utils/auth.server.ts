import { redirect } from "@remix-run/react"
import { db } from "./db/index.server"
import { authSessionStorage } from "./session.server"
import { sessions } from "./db/schema"
import { eq } from "drizzle-orm"
import { safeRedirect } from "remix-utils/safe-redirect"
import { combineHeaders } from "./utils"
import { hash, verify } from "@node-rs/argon2"

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export function getSessionExpirationDate() {
  return new Date(Date.now() + SESSION_EXPIRATION_TIME)
}
export const sessionKey = "sessionId"

export async function getUser(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  )

  const sessionId = authSession.get(sessionKey)
  if (!sessionId) return null

  const session = await db.query.sessions.findFirst({
    with: {
      user: true,
    },
    where: (sessions, { and, eq, gt }) =>
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date(Date.now()))
      ),
  })

  if (!session?.user) {
    throw redirect("/auth/sign-in", {
      headers: {
        "Set-Cookie": await authSessionStorage.destroySession(authSession),
      },
    })
  }

  return {
    userId: session.user.id,
    role: session.user.role,
  }
}

export async function requireUser(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const user = await getUser(request)
  if (!user) {
    const requestUrl = new URL(request.url)
    redirectTo =
      redirectTo === null
        ? null
        : redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
    const loginRedirect = ["/auth/sign-in", loginParams?.toString()]
      .filter(Boolean)
      .join("?")

    throw redirect(loginRedirect)
  }

  return user
}

export async function requireAnonymous(request: Request) {
  const user = await getUser(request)
  if (user) {
    throw redirect("/")
  }
}

export async function login({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const user = await verifyUserPassword({ email, password })

  if (!user) return null

  const [session] = await db
    .insert(sessions)
    .values({
      expiresAt: getSessionExpirationDate(),
      userId: user.id,
    })
    .returning()

  return session
}

export async function verifyUserPassword({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const userWithPassword = await db.query.users.findFirst({
    columns: {
      id: true,
      passwordHash: true,
    },
    where: (users, { eq }) => eq(users.email, email),
  })

  if (!userWithPassword) return null

  const isValid = await verify(userWithPassword.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })

  if (!isValid) return null

  return {
    id: userWithPassword.id,
  }
}

export async function logout(
  {
    request,
    redirectTo = "/auth/sign-in",
  }: {
    request: Request
    redirectTo?: string
  },
  responseInit?: ResponseInit
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  )

  const sessionId = authSession.get(sessionKey)

  if (sessionId) {
    await db.delete(sessions).where(eq(sessions.id, sessionId))
  }

  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      {
        "Set-Cookie": await authSessionStorage.destroySession(authSession),
      },
      responseInit?.headers
    ),
  })
}

export async function getPasswordHash(password: string) {
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  })
  return passwordHash
}
