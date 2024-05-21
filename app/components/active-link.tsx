import { NavLink, NavLinkProps, useLocation } from "@remix-run/react"

export function ActiveLink(props: NavLinkProps) {
  const { pathname } = useLocation()

  return (
    <NavLink
      {...props}
      data-current={pathname === props.to}
      className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[current=true]:text-foreground"
    />
  )
}
