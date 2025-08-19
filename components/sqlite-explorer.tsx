"use client"

import { useState, useEffect } from 'react'
import { useSQLite } from '@/lib/sqlite-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Table as TableIcon, 
  Play, 
  RefreshCw, 
  FileText, 
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export function SQLiteExplorer() {
  const { client, isLoading, error, executeQuery, getTables, getTableData, clearError } = useSQLite()
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableData, setTableData] = useState<any>(null)
  const [customQuery, setCustomQuery] = useState('SELECT * FROM jobs WHERE type = "infrastructure" ORDER BY createdAt DESC LIMIT 10')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [databaseInfo, setDatabaseInfo] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('tables')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(50)

  // Load database info and tables on mount
  useEffect(() => {
    loadDatabaseInfo()
    loadTables()
  }, [])

  const loadDatabaseInfo = async () => {
    try {
      const info = await client.getDatabaseInfo()
      setDatabaseInfo(info)
    } catch (err) {
      console.error('Failed to load database info:', err)
    }
  }

  const loadTables = async () => {
    try {
      const tableList = await getTables()
      setTables(tableList)
    } catch (err) {
      console.error('Failed to load tables:', err)
    }
  }

  const loadTableData = async (tableName: string, page: number = 0) => {
    try {
      console.log('🔄 Loading table data for:', tableName, 'page:', page)
      const data = await getTableData(tableName, pageSize, page * pageSize)
      console.log('📊 Received table data:', data)
      setTableData(data)
      setSelectedTable(tableName)
      setCurrentPage(page)
      // Automatically switch to the data tab to show the records
      setActiveTab('data')
    } catch (err) {
      console.error('❌ Failed to load table data:', err)
    }
  }

  const runCustomQuery = async () => {
    try {
      const result = await executeQuery(customQuery)
      setQueryResult(result)
    } catch (err) {
      console.error('Failed to execute query:', err)
    }
  }

  const renderTableData = (data: any) => {
    console.log('🎨 Rendering table data:', data)
    if (!data || !data.columns || !data.values) {
      console.log('❌ No data available for rendering')
      return <p>No data available</p>
    }

    if (data.values.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <TableIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No records found in this table</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total records: {data.values.length}</span>
          <span>Columns: {data.columns.length}</span>
        </div>
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {data.columns.map((column: string, index: number) => (
                  <TableHead key={index} className="font-semibold text-gray-700">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.values.map((row: any[], rowIndex: number) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell: any, cellIndex: number) => (
                    <TableCell key={cellIndex} className="max-w-xs">
                      <div className="truncate" title={String(cell)}>
                        {cell === null ? (
                          <span className="text-gray-400 italic">null</span>
                        ) : typeof cell === 'object' ? (
                          <span className="text-blue-600 font-mono text-xs">
                            {JSON.stringify(cell).substring(0, 100)}
                            {JSON.stringify(cell).length > 100 ? '...' : ''}
                          </span>
                        ) : (
                          <span className={typeof cell === 'string' && cell.length > 50 ? 'font-mono text-xs' : ''}>
                            {String(cell)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            SQLite Database Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {databaseInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <TableIcon className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Tables</p>
                  <p className="text-lg font-bold text-blue-700">{databaseInfo.totalTables}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Status</p>
                  <p className="text-lg font-bold text-green-700">Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Database</p>
                  <p className="text-xs font-mono text-purple-700 truncate">
                    {databaseInfo.databasePath.split('/').pop()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Database Structure Info */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 Database Structure</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>jobs table:</strong> Contains infrastructure jobs and project data (where your dashboard projects come from) - <span className="text-green-700 font-semibold">100+ records</span></p>
              <p><strong>projects table:</strong> Contains a separate projects registry (currently has 1 record) - <span className="text-orange-700 font-semibold">1 record</span></p>
              <p><strong>users table:</strong> User account information</p>
              <p><strong>deployments table:</strong> Deployment history and status</p>
              <p className="text-orange-700 font-semibold mt-2">💡 Note: Your dashboard shows projects derived from the jobs table, not the projects table!</p>
            </div>
          </div>

          {/* Memory Management Warning */}
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Memory Management</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Large queries may be limited to 1000 rows to prevent memory issues. Use LIMIT clauses for better performance.
            </p>
          </div>

          {/* Debug Info */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p><strong>Debug:</strong> Active Tab: {activeTab} | Selected Table: {selectedTable || 'None'} | Has Data: {tableData ? 'Yes' : 'No'}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="query">Custom Query</TabsTrigger>
              <TabsTrigger value="data">Table Data ({selectedTable || 'None'})</TabsTrigger>
            </TabsList>

            <TabsContent value="tables" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Database Tables</h3>
                <Button onClick={loadTables} disabled={isLoading} size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tables.map((table) => (
                  <Card 
                    key={table} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedTable === table ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    } ${table === 'jobs' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                    onClick={() => loadTableData(table)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <TableIcon className={`h-4 w-4 ${table === 'jobs' ? 'text-green-600' : 'text-blue-600'}`} />
                        <span className="font-mono text-sm">{table}</span>
                        {table === 'jobs' && (
                          <Badge variant="secondary" className="text-xs ml-auto">Main Data</Badge>
                        )}
                        {selectedTable === table && isLoading && (
                          <RefreshCw className="h-3 w-3 text-blue-600 animate-spin ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="query" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SQL Query</label>
                <Textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Enter your SQL query..."
                  className="font-mono text-sm"
                  rows={4}
                />
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Helpful Queries:</strong></p>
                <button 
                  onClick={() => setCustomQuery('SELECT * FROM jobs WHERE type = "infrastructure" ORDER BY createdAt DESC LIMIT 10')}
                  className="text-blue-600 hover:underline block"
                >
                  • Recent infrastructure jobs
                </button>
                <button 
                  onClick={() => setCustomQuery('SELECT projectId, COUNT(*) as jobCount, MAX(createdAt) as lastJob FROM jobs WHERE type = "infrastructure" GROUP BY projectId ORDER BY lastJob DESC')}
                  className="text-blue-600 hover:underline block"
                >
                  • Projects with job counts
                </button>
                <button 
                  onClick={() => setCustomQuery('SELECT status, COUNT(*) as count FROM jobs WHERE type = "infrastructure" GROUP BY status')}
                  className="text-blue-600 hover:underline block"
                >
                  • Job status summary
                </button>
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <p className="font-medium text-red-700">⚠️ Cleanup Queries (Use with caution):</p>
                  <button 
                    onClick={() => setCustomQuery("DELETE FROM jobs WHERE createdAt < '2025-08-13T00:00:00.000Z' LIMIT 10")}
                    className="text-red-600 hover:underline block"
                  >
                    • Delete old jobs (before Aug 13) - LIMIT 10
                  </button>
                  <button 
                    onClick={() => setCustomQuery("DELETE FROM jobs WHERE status = 'failed' AND createdAt < '2025-08-15T00:00:00.000Z' LIMIT 10")}
                    className="text-red-600 hover:underline block"
                  >
                    • Delete old failed jobs - LIMIT 10
                  </button>
                </div>
              </div>
              
              <Button onClick={runCustomQuery} disabled={isLoading}>
                <Play className="h-4 w-4 mr-2" />
                Execute Query
              </Button>

              {queryResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">Query Result</span>
                    <Badge variant={queryResult.success ? "default" : "destructive"}>
                      {queryResult.success ? "Success" : "Error"}
                    </Badge>
                  </div>
                  {queryResult.error && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{queryResult.error}</AlertDescription>
                    </Alert>
                  )}
                  {queryResult.success && (
                    <div className="space-y-4">
                      {/* Show rows affected for non-SELECT operations */}
                      {queryResult.rowsAffected !== undefined && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Operation completed successfully
                            </span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Rows affected: {queryResult.rowsAffected}
                            {queryResult.lastInsertRowid && (
                              <span className="ml-2">• Last insert ID: {queryResult.lastInsertRowid}</span>
                            )}
                          </p>
                        </div>
                      )}
                      
                      {/* Show table data for SELECT operations */}
                      {queryResult.columns && queryResult.columns.length > 0 && renderTableData(queryResult)}
                      
                      {/* Show message for operations with no data to display */}
                      {(!queryResult.columns || queryResult.columns.length === 0) && queryResult.rowsAffected === undefined && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Query executed successfully. No data to display.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              {selectedTable ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Table: <span className="font-mono">{selectedTable}</span>
                      </h3>
                      {tableData && (
                        <p className="text-sm text-gray-600 mt-1">
                          Showing {tableData.values?.length || 0} records (Page {currentPage + 1})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => loadTableData(selectedTable, currentPage - 1)} 
                        disabled={isLoading || currentPage === 0} 
                        size="sm"
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button 
                        onClick={() => loadTableData(selectedTable, currentPage + 1)} 
                        disabled={isLoading || !tableData?.values || tableData.values.length < pageSize} 
                        size="sm"
                        variant="outline"
                      >
                        Next
                      </Button>
                      <Button onClick={() => loadTableData(selectedTable, 0)} disabled={isLoading} size="sm">
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  {tableData && (
                    <div className="space-y-4">
                      {/* Raw Data Debug */}
                      <details className="bg-gray-50 p-3 rounded">
                        <summary className="cursor-pointer font-medium">Debug: Raw Data</summary>
                        <pre className="text-xs mt-2 overflow-auto">
                          {JSON.stringify(tableData, null, 2)}
                        </pre>
                      </details>
                      
                      {/* Rendered Table */}
                      {renderTableData(tableData)}
                    </div>
                  )}
                  {!tableData && (
                    <div className="text-center py-8 text-gray-500">
                      <TableIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Loading table data...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TableIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a table from the Tables tab to view its data</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 