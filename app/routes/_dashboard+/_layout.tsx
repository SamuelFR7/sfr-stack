import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, json, useLoaderData } from "@remix-run/react";
import { Header } from "~/components/header";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return json({
    isAdmin: user.role === "admin",
  });
}

export default function DashboardLayout() {
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex-col antialiased">
      <Header isAdmin={isAdmin} />
      <Outlet />
    </div>
  );
}
