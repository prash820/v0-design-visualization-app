'use client';

import { useState, useEffect } from 'react';
import { GeolocationRegionSelector } from '@/components/geolocation-region-selector';
import { getNearestRegion } from '@/lib/geolocation';

export default function TestGeolocation() {
  const [selectedRegion, setSelectedRegion] = useState('us-east-1');
  const [testResult, setTestResult] = useState<string>('');

  const testGeolocation = async () => {
    try {
      setTestResult('Testing geolocation...');
      const result = await getNearestRegion();
      setTestResult(`Success! Detected region: ${result.region.name} (${result.region.value}) with ${result.region.latency}ms latency`);
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Geolocation Test Page</h1>
      
      <div className="space-y-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <button 
            onClick={testGeolocation}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Geolocation
          </button>
          {testResult && (
            <div className="mt-4 p-3 bg-white rounded border">
              <pre className="text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        <GeolocationRegionSelector
          value={selectedRegion}
          onChange={setSelectedRegion}
          showCard={true}
        />

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Selection</h2>
          <p>Selected Region: <strong>{selectedRegion}</strong></p>
        </div>
      </div>
    </div>
  );
} 