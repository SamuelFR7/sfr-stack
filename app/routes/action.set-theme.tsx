import { parseWithZod } from "@conform-to/zod"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { z } from "zod"
import { invariantResponse } from "@epic-web/invariant"
import { setTheme } from "~/utils/theme.server"

export const themeFormSchema = z.object({
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
