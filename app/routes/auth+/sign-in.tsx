import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { login, requireAnonymous } from "~/utils/auth.server"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Form, useActionData, useSearchParams } from "@remix-run/react"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { HoneypotInputs } from "remix-utils/honeypot/react"
import { FormItem } from "~/components/form-item"
import { FormMessage } from "~/components/form-message"
import { useIsPending } from "~/utils/misc"
import { Loader2 } from "lucide-react"
import { parseWithZod } from "@conform-to/zod"
import { z } from "zod"
import { checkHoneypot } from "~/utils/honeypot.server"
import { handleNewSession } from "~/utils/session.server"

const schema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return null
}

export default function SignInPage() {
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get("redirectTo")

  const lastResult = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "sign-in-form",
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema })
    },
    defaultValue: {
      redirectTo,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })

  const isPending = useIsPending()

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block"></div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign in</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email and password.
            </p>
          </div>

          <Form className="space-y-2" method="post" {...getFormProps(form)}>
            <HoneypotInputs />
            <FormItem>
              <Label htmlFor={fields.email.id}>Email</Label>
              <Input {...getInputProps(fields.email, { type: "text" })} />
              <FormMessage errors={fields.email.errors} />
            </FormItem>
            <FormItem>
              <Label htmlFor={fields.password.id}>Password</Label>
              <Input
                {...getInputProps(fields.password, { type: "password" })}
              />
              <FormMessage errors={fields.password.errors} />
            </FormItem>
            <input {...getInputProps(fields.redirectTo, { type: "hidden" })} />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const formData = await request.formData()
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      schema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await login(data)

        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email or password are incorrects",
            path: ["email"],
          })
          return z.NEVER
        }

        return {
          ...data,
          session,
        }
      }),
    async: true,
  })

  if (submission.status !== "success" || !submission.value.session) {
    return submission.reply({ hideFields: ["password"] })
  }

  const { session, redirectTo } = submission.value

  return handleNewSession({
    session,
    redirectTo,
    request,
  })
}
