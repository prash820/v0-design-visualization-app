import { SQLiteExplorer } from '@/components/sqlite-explorer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Database, Home } from 'lucide-react'
import Link from 'next/link'

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Database Explorer</h1>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-gray-600 max-w-3xl">
            Explore your application's database in real-time. View tables, execute custom queries, 
            and monitor database performance. This tool provides direct access to your SQLite database 
            for debugging and data analysis.
          </p>
        </div>

        {/* SQLite Explorer Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <SQLiteExplorer />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Database operations are performed through secure API endpoints. 
            All queries are logged for debugging purposes.
          </p>
        </div>
      </div>
    </div>
  )
} 