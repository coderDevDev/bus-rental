"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function SignOutButton(props: ButtonProps) {
  const { signOut } = useAuth()

  return (
    <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={signOut} {...props}>
      Sign Out
    </Button>
  )
}

