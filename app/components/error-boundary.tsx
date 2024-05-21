import { Link, isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { buttonVariants } from "./ui/button"

export function GeneralErrorBoundary() {
  const error = useRouteError()

  return (
    <div className="min flex min-h-screen w-full flex-col items-center justify-center space-y-2 bg-destructive/40">
      <h1 className="text-lg text-destructive">
        {isRouteErrorResponse(error) ? (
          <p className="text-destructive-foreground">{error.data}</p>
        ) : (
          <p className="text-destructive-foreground">Something went wrong</p>
        )}
      </h1>
      <Link
        to="/"
        className={buttonVariants({
          variant: "destructive",
        })}
      >
        Back to home
      </Link>
    </div>
  )
}
