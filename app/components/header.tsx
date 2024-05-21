import { Link, NavLink } from "@remix-run/react"
import { Menu, Notebook } from "lucide-react"
import { cn } from "~/utils/utils"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Button } from "./ui/button"
import { LogoutButton } from "./logout-button"
import { ThemeSwitch } from "./theme-switch"
import { useTheme } from "~/root"

export function Header({ isAdmin }: { isAdmin: boolean }) {
  const theme = useTheme()

  return (
    <header className="top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Notebook className="h-6 w-6" />
        </Link>
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-primary"
            )
          }
        >
          Home
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                isActive && "text-primary"
              )
            }
          >
            Admin
          </NavLink>
        )}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Notebook className="h-6 w-6" />
            </Link>
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-muted-foreground hover:text-foreground",
                  isActive && "text-primary"
                )
              }
            >
              Home
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "text-muted-foreground hover:text-foreground",
                    isActive && "text-primary"
                  )
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <ThemeSwitch userPreference={theme} />
        <LogoutButton />
      </div>
    </header>
  )
}
