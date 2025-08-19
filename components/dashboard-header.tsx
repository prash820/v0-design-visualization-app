"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BarChart2, User, LogOut, Menu } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, logoutUser } from "@/lib/api/auth"

interface DashboardHeaderProps {
  title?: string;
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Get user from auth service
    const currentUser = getCurrentUser()

    if (currentUser) {
      setUser(currentUser)
    } else {
      // If no user is found, redirect to login
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    logoutUser()

    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    })

    router.push("/login")
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <BarChart2 className="h-6 w-6" />
            <span>VisualizeAI</span>
          </Link>
          {title && (
            <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
              {title}
            </span>
          )}
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
          <Link href="/database" className="text-sm font-medium hover:underline underline-offset-4">
            Database
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.email || "user@example.com"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/database">Database</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
