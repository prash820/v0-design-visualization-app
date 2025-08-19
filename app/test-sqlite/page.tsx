"use client"

import { SQLiteExplorer } from '@/components/sqlite-explorer'

export default function TestSQLitePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">SQLite Explorer Test</h1>
      <p className="text-gray-600 mb-6">
        This is a test page to verify the SQLite Explorer component is working correctly.
      </p>
      <SQLiteExplorer />
    </div>
  )
} 