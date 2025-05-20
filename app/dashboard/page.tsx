"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Folder, Clock, BarChart2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import { getProjects, createProject } from "@/lib/api/projects"
import { validateToken } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { Project } from "@/lib/types"

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const isValid = await validateToken()

        if (!isValid) {
          router.push("/login")
          return
        }

        setIsAuthenticated(true)

        // Load projects
        loadProjects()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const loadProjects = async () => {
    setIsLoading(true)

    try {
      const projectsData = await getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error("Error loading projects:", error)
      toast({
        title: "Error loading projects",
        description: error instanceof ApiError ? error.message : "Failed to load projects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const newProject = await createProject({
        name: newProjectName,
        description: newProjectDescription,
      })

      // Log the project data to verify the ID field
      console.log("Created project:", newProject)

      // Get the project ID, checking both id and _id fields
      const projectId = newProject?.id || newProject?._id

      // Check if we have a valid project ID
      if (!projectId) {
        throw new Error("Project created but no ID was returned")
      }

      // Add the new project to the list
      setProjects([...projects, newProject])

      // Reset form fields
      setNewProjectName("")
      setNewProjectDescription("")
      setOpen(false)

      toast({
        title: "Project created",
        description: "Your new project has been created successfully.",
      })

      // Navigate to the new project page
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error creating project",
        description: error instanceof ApiError ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <DialogContent>
              <form onSubmit={handleCreateProject}>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Create a new project to start generating visualizations.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            {!Array.isArray(projects) || projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800 mb-4">
                  <Folder className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                  Create your first project to start generating visualizations and documentation.
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  // Get the project ID, checking both id and _id fields
                  const projectId = project?.id || project?._id

                  if (!projectId) {
                    console.error("Project missing ID:", project)
                    return null
                  }

                  return (
                    <Link href={`/projects/${projectId}`} key={projectId}>
                      <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                        <CardHeader>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription className="flex items-center text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Created {new Date(project.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {project.description || "No description provided"}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <BarChart2 className="mr-1 h-3 w-3" />
                            {project.diagramType || "No diagrams yet"}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="recent">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(projects) && projects.length > 0 ? (
                projects
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 6)
                  .map((project) => {
                    // Get the project ID, checking both id and _id fields
                    const projectId = project?.id || project?._id

                    if (!projectId) {
                      console.error("Project missing ID:", project)
                      return null
                    }

                    return (
                      <Link href={`/projects/${projectId}`} key={projectId}>
                        <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                          <CardHeader>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription className="flex items-center text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              Created {new Date(project.createdAt).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {project.description || "No description provided"}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <BarChart2 className="mr-1 h-3 w-3" />
                              {project.diagramType || "No diagrams yet"}
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    )
                  })
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No recent projects found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
