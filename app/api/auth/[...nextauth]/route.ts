import NextAuth from "next-auth"
import { NextAuthOptions, DefaultSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    backendToken?: string;
  }
}

// Get the base URL for callbacks
const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.access_token) return false

      try {
        // Call your backend to handle OAuth
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: account.provider,
            accessToken: account.access_token,
            user: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          }),
        })

        if (!response.ok) {
          console.error('Backend auth failed:', await response.text())
          return false
        }

        const data = await response.json()
        if (!data.token) {
          console.error('No token received from backend')
          return false
        }

        // Store the backend token in the account object
        account.backendToken = data.token
        return true
      } catch (error) {
        console.error('Auth error:', error)
        return false
      }
    },
    async jwt({ token, account }) {
      // Pass the backend token to the token object
      if (account?.backendToken) {
        token.backendToken = account.backendToken
      }
      return token
    },
    async session({ session, token }) {
      // Pass the backend token to the session
      if (token.backendToken) {
        session.backendToken = token.backendToken
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// TODO: Replace the placeholder client IDs and secrets with real values in your .env file. 