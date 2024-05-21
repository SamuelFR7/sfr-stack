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
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node"
import stylesheet from "./tailwind.css?url"
import { honeypot } from "./utils/honeypot.server"
import { HoneypotProvider } from "remix-utils/honeypot/react"
import { Theme, getTheme } from "./utils/theme.server"
import clsx from "clsx"
import { ReactNode } from "react"
import { GeneralErrorBoundary } from "./components/error-boundary"
import { getDomainUrl } from "./utils/misc"
import { useRequestInfo } from "./utils/request-info"
import { parseWithZod } from "@conform-to/zod"
import { themeFormSchema } from "./routes/action.set-theme"

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
