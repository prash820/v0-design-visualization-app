import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function AuthButton() {
  const router = useRouter()

  const handleSignIn = () => {
    // TODO: Implement your own authentication logic here
    console.log("Sign in clicked")
  }

  const handleSignOut = () => {
    // TODO: Implement your own sign out logic here
    console.log("Sign out clicked")
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handleSignIn}
      >
        Sign In
      </Button>
      <Button
        variant="outline"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </div>
  )
}
