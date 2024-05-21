import { getFormProps, useForm } from "@conform-to/react"
import { useFetcher } from "@remix-run/react"
import { Moon, Sun } from "lucide-react"
import { useOptimisticThemeMode } from "~/root"
import { action } from "~/routes/action.set-theme"
import { Theme } from "~/utils/theme.server"
import { Button } from "./ui/button"

export function ThemeSwitch({
  userPreference,
}: {
  userPreference?: Theme | null
}) {
  const fetcher = useFetcher<typeof action>()

  const [form] = useForm({
    id: "theme-switch",
    lastResult: fetcher.data?.result,
  })

  const optimisticMode = useOptimisticThemeMode()
  const mode = optimisticMode ?? userPreference ?? "light"
  const nextMode = mode === "light" ? "dark" : "light"
  const modeLabel = {
    light: (
      <Sun>
        <span className="sr-only">Light</span>
      </Sun>
    ),
    dark: (
      <Moon>
        <span className="sr-only">Dark</span>
      </Moon>
    ),
  }

  return (
    <fetcher.Form
      method="post"
      action="/action/set-theme"
      {...getFormProps(form)}
      className="ml-auto"
    >
      <input type="hidden" name="theme" value={nextMode} />
      <div className="flex gap-2">
        <Button size="icon" variant="outline" type="submit">
          {modeLabel[mode]}
        </Button>
      </div>
    </fetcher.Form>
  )
}
