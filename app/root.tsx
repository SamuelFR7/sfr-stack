import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useFetchers,
  useLoaderData,
} from "@remix-run/react"
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node"
import stylesheet from "./tailwind.css?url"
import { honeypot } from "./utils/honeypot.server"
import { HoneypotProvider } from "remix-utils/honeypot/react"
import { Theme, getTheme, setTheme } from "./utils/theme.server"
import clsx from "clsx"
import { ReactNode } from "react"
import { GeneralErrorBoundary } from "./components/error-boundary"
import { getDomainUrl } from "./utils/misc"
import { useRequestInfo } from "./utils/request-info"
import { parseWithZod } from "@conform-to/zod"
import { invariantResponse } from "@epic-web/invariant"
import { z } from "zod"

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
]

export const meta: MetaFunction = () => [
  {
    title: "SFR App",
  },
]

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    honeypotInputProps: honeypot.getInputProps(),
    requestInfo: {
      origin: getDomainUrl(request),
      path: new URL(request.url).pathname,
      userPrefs: {
        theme: getTheme(request),
      },
    },
  })
}

const themeFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: themeFormSchema,
  })

  invariantResponse(submission.status === "success", "Invalid theme received")

  const { theme } = submission.value

  const responseInit = {
    headers: { "Set-Cookie": setTheme(theme) },
  }

  return json(
    {
      result: submission.reply(),
    },
    responseInit
  )
}

export default function AppWithProviders() {
  const { honeypotInputProps } = useLoaderData<typeof loader>()

  return (
    <HoneypotProvider {...honeypotInputProps}>
      <App />
    </HoneypotProvider>
  )
}

function Document({ children, theme }: { children: ReactNode; theme?: Theme }) {
  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export function App() {
  const theme = useTheme()

  return (
    <Document theme={theme}>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  )
}

export function useTheme() {
  const requestInfo = useRequestInfo()
  const optimisticMode = useOptimisticThemeMode()
  if (optimisticMode) {
    return optimisticMode ?? "light"
  }
  return requestInfo.userPrefs.theme ?? "light"
}

export function useOptimisticThemeMode() {
  const fetchers = useFetchers()
  const themeFetcher = fetchers.find(
    (f) => f.formAction === "/action/set-theme"
  )

  if (themeFetcher && themeFetcher.formData) {
    const submission = parseWithZod(themeFetcher.formData, {
      schema: themeFormSchema,
    })

    if (submission.status === "success") {
      return submission.value.theme
    }
  }
}
