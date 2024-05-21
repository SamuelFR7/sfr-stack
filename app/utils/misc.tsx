import { useFormAction, useNavigation } from "@remix-run/react"

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
