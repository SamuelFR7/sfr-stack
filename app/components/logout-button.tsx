import { Form } from "@remix-run/react"
import { Button } from "./ui/button"
import { useIsPending } from "~/utils/misc"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const isPending = useIsPending()

  return (
    <Form action="/logout" method="post">
      <Button size="icon" variant="outline" disabled={isPending} type="submit">
        <LogOut />
      </Button>
    </Form>
  )
}
