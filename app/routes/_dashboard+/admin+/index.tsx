import { LoaderFunctionArgs } from "@remix-run/node"
import { requireUserWithRole } from "~/utils/permissions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, "admin")
  return null
}

export default function AdminPage() {
  return <h1 className="text-3xl font-bold">Hello admin</h1>
}
