import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AuthButtonProps {
  provider?: "google" | "github"
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function AuthButton({ provider, variant = "default", className = "" }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (session) {
        await signOut()
      } else if (provider) {
        await signIn(provider)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <Button variant={variant} disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {session ? "Signing out..." : "Signing in..."}
      </Button>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <Button 
          variant={variant} 
          onClick={handleAuth}
          className={`${className} bg-red-500 hover:bg-red-600`}
        >
          Try Again
        </Button>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <Button 
      variant={variant} 
      onClick={handleAuth}
      className={className}
    >
      {session ? "Sign Out" : provider ? `Sign in with ${provider}` : "Sign In"}
    </Button>
  )
} 