// SQLite Client for Frontend
// Connects to SQLite through REST API endpoints

import { apiClient } from './api/client';
import { useState } from 'react';

export interface SQLiteQuery {
  sql: string;
  params?: any[];
}

export interface SQLiteResult {
  columns: string[];
  values: any[][];
  rowsAffected?: number;
  lastInsertRowid?: number;
  success: boolean;
  error?: string;
}

export interface TableInfo {
  name: string;
  schema: ColumnInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export class SQLiteClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/sqlite') {
    this.baseUrl = baseUrl;
  }

  async query(query: SQLiteQuery): Promise<SQLiteResult> {
    try {
      const response = await apiClient.post<SQLiteResult>(`${this.baseUrl}/query`, query);
      return response;
    } catch (error) {
      console.error('❌ SQLite query failed:', error);
      throw error;
    }
  }

  async getTables(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(`${this.baseUrl}/tables`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get tables:', error);
      throw error;
    }
  }

  async getTableInfo(tableName: string): Promise<TableInfo> {
    try {
      const response = await apiClient.get<TableInfo>(`${this.baseUrl}/table/${tableName}`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get table info:', error);
      throw error;
    }
  }

  async getTableData(tableName: string, limit: number = 100, offset: number = 0): Promise<SQLiteResult> {
    try {
      const response = await apiClient.get<SQLiteResult>(
        `${this.baseUrl}/table/${tableName}/data?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      console.error('❌ Failed to get table data:', error);
      throw error;
    }
  }

  async execute(sql: string, params?: any[]): Promise<SQLiteResult> {
    return await this.query({ sql, params });
  }

  async getDatabaseInfo(): Promise<{
    tables: string[];
    totalTables: number;
    databasePath: string;
  }> {
    try {
      const response = await apiClient.get<{
        tables: string[];
        totalTables: number;
        databasePath: string;
      }>(`${this.baseUrl}/info`);
      return response;
    } catch (error) {
      console.error('❌ Failed to get database info:', error);
      throw error;
    }
  }
}

// Hook for React components
export const useSQLite = () => {
  const [client] = useState(() => new SQLiteClient());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = async (sql: string, params?: any[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await client.query({ sql, params });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Query failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTables = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await client.getTables();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get tables';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTableData = async (tableName: string, limit: number = 100, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await client.getTableData(tableName, limit, offset);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get table data';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    client,
    isLoading,
    error,
    executeQuery,
    getTables,
    getTableData,
    clearError: () => setError(null)
  };
}; 