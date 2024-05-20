import { LoaderFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { requireUser } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);

  return null;
}

export default function Index() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Counter: {count}</h1>
      <Button onClick={increment}>Increment</Button>
    </div>
  );
}
