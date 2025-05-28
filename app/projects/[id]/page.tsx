import { Suspense } from "react"
import ProjectPageClient from "./project-page-client"

// This is the server component
export default async function ProjectPage({ params }: { params: { id: string } }) {
  // Await params if needed (for dynamic routes in server components)
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectPageClient id={resolvedParams.id} />
    </Suspense>
  )
}
