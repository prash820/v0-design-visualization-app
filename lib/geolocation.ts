// AWS Region coordinates and metadata
export interface AWSRegion {
  name: string;
  value: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  latency?: number; // Estimated latency in ms
}

export const AWS_REGIONS: AWSRegion[] = [
  {
    name: 'US East (N. Virginia)',
    value: 'us-east-1',
    coordinates: { lat: 38.9072, lng: -77.0369 },
    description: 'Most popular, lowest latency for US East Coast'
  },
  {
    name: 'US West (Oregon)',
    value: 'us-west-2',
    coordinates: { lat: 45.5152, lng: -122.6784 },
    description: 'Good for US West Coast, competitive pricing'
  },
  {
    name: 'Europe (Ireland)',
    value: 'eu-west-1',
    coordinates: { lat: 53.3498, lng: -6.2603 },
    description: 'Primary European region, good for EU compliance'
  },
  {
    name: 'Asia Pacific (Singapore)',
    value: 'ap-southeast-1',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    description: 'Good for Asia-Pacific markets'
  },
  {
    name: 'Canada (Central)',
    value: 'ca-central-1',
    coordinates: { lat: 45.5017, lng: -73.5673 },
    description: 'Canadian region for data residency'
  },
  {
    name: 'Europe (Frankfurt)',
    value: 'eu-central-1',
    coordinates: { lat: 50.1109, lng: 8.6821 },
    description: 'Central Europe, good performance'
  },
  {
    name: 'Asia Pacific (Tokyo)',
    value: 'ap-northeast-1',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    description: 'Japan region, good for Japanese market'
  },
  {
    name: 'South America (São Paulo)',
    value: 'sa-east-1',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    description: 'South American region'
  },
  {
    name: 'Asia Pacific (Mumbai)',
    value: 'ap-south-1',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    description: 'India region, good for Indian market'
  },
  {
    name: 'Europe (London)',
    value: 'eu-west-2',
    coordinates: { lat: 51.5074, lng: -0.1278 },
    description: 'UK region, good for UK compliance'
  },
  {
    name: 'US East (Ohio)',
    value: 'us-east-2',
    coordinates: { lat: 39.9612, lng: -82.9988 },
    description: 'US East Coast alternative'
  },
  {
    name: 'Asia Pacific (Sydney)',
    value: 'ap-southeast-2',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    description: 'Australia region'
  }
];

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Find the nearest AWS region based on coordinates
export function findNearestRegion(lat: number, lng: number): AWSRegion {
  let nearestRegion = AWS_REGIONS[0]; // Default to us-east-1
  let shortestDistance = Infinity;

  for (const region of AWS_REGIONS) {
    const distance = calculateDistance(lat, lng, region.coordinates.lat, region.coordinates.lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestRegion = region;
    }
  }

  return {
    ...nearestRegion,
    latency: Math.round(shortestDistance * 2) // Rough estimate: 2ms per 100km
  };
}

// Get user's geolocation and find nearest region
export async function getNearestRegion(): Promise<{ region: AWSRegion; userLocation?: { lat: number; lng: number } }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to us-east-1 if geolocation is not supported
      resolve({ region: AWS_REGIONS[0] });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const nearestRegion = findNearestRegion(lat, lng);
        resolve({ 
          region: nearestRegion, 
          userLocation: { lat, lng } 
        });
      },
      (error) => {
        console.warn('Geolocation failed:', error);
        // Fallback to us-east-1 if geolocation fails
        resolve({ region: AWS_REGIONS[0] });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Get region by value
export function getRegionByValue(value: string): AWSRegion | undefined {
  return AWS_REGIONS.find(region => region.value === value);
}

// Get all regions for manual selection (fallback)
export function getAllRegions(): AWSRegion[] {
  return AWS_REGIONS;
} 