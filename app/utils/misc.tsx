import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useFormAction, useNavigation } from "@remix-run/react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useIsPending({
  formAction,
  formMethod = "POST",
  state = "non-idle",
}: {
  formAction?: string
  formMethod?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE"
  state?: "submitting" | "loading" | "non-idle"
} = {}) {
  const contextualFormAction = useFormAction()
  const navigation = useNavigation()
  const isPendingState =
    state === "non-idle"
      ? navigation.state !== "idle"
      : navigation.state === state
  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  )
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}

export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

export function combineResponseInits(
  ...responseInits: Array<ResponseInit | null | undefined>
) {
  let combined: ResponseInit = {}
  for (const responseInit of responseInits) {
    combined = {
      ...responseInit,
      headers: combineHeaders(combined.headers, responseInit?.headers),
    }
  }
  return combined
}
