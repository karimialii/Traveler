'use client';

import { useEffect, useMemo, useState } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { ItineraryItem } from '@/types/travel';

interface Props {
  itinerary: ItineraryItem[];
  apiKey: string;
}

interface Location {
  lat: number;
  lng: number;
  title: string;
  type: string;
}

// Component to handle directions
function DirectionsRenderer({ 
  locations 
}: { 
  locations: Location[] 
}) {
  const map = useMap();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!map) return;

    const service = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#4F46E5',
        strokeWeight: 4,
      },
    });

    setDirectionsService(service);
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || locations.length < 2) return;

    const waypoints = locations.slice(1, -1).map(loc => ({
      location: new google.maps.LatLng(loc.lat, loc.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new google.maps.LatLng(locations[0].lat, locations[0].lng),
        destination: new google.maps.LatLng(
          locations[locations.length - 1].lat,
          locations[locations.length - 1].lng
        ),
        waypoints: waypoints.slice(0, 8), // Google Maps API limit
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          setError(false);
        } else {
          console.warn('Directions request failed:', status);
          setError(true);
        }
      }
    );
  }, [directionsService, directionsRenderer, locations]);

  return null;
}

// Geocoding function to convert location names to coordinates
async function geocodeLocation(locationName: string, apiKey: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

export default function ItineraryMap({ itinerary, apiKey }: Props) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDirections, setShowDirections] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Geocode all locations
  useEffect(() => {
    const geocodeAllLocations = async () => {
      setLoading(true);
      setError(null);
      const geocodedLocations: Location[] = [];

      try {
        for (const item of itinerary) {
          const coords = await geocodeLocation(item.location, apiKey);
          if (coords) {
            geocodedLocations.push({
              ...coords,
              title: item.activity,
              type: item.type,
            });
          }
        }

        if (geocodedLocations.length === 0) {
          setError('Could not geocode any locations. Please check your Google Maps API key and ensure Geocoding API is enabled.');
        }

        setLocations(geocodedLocations);
      } catch (err) {
        setError('Failed to load map locations. Please check your API key configuration.');
        console.error('Geocoding error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (itinerary.length > 0) {
      geocodeAllLocations();
    }
  }, [itinerary, apiKey]);

  // Calculate center and zoom
  const mapCenter = useMemo(() => {
    if (locations.length === 0) return { lat: 48.8566, lng: 2.3522 }; // Default to Paris

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

    return { lat: avgLat, lng: avgLng };
  }, [locations]);

  const getMarkerColor = (type: string) => {
    const colors: Record<string, string> = {
      accommodation: '#10b981', // green
      activity: '#3b82f6', // blue
      dining: '#f59e0b', // amber
      transport: '#6b7280', // gray
    };
    return colors[type] || '#6366f1'; // default indigo
  };

  if (!apiKey) {
    return (
      <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Map Configuration Required</h3>
        <p className="text-sm text-yellow-800 mb-3">
          Google Maps API key is not configured. To enable the interactive map:
        </p>
        <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
          <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="underline">Google Cloud Console</a></li>
          <li>Create or use an existing API key</li>
          <li>Enable: Maps JavaScript API, Geocoding API, and Directions API</li>
          <li>Add the key to .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-base font-semibold text-gray-900">Map View</h3>
        {!error && locations.length > 1 && (
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-medium transition"
          >
            {showDirections ? '🗺️ Hide Route' : '🗺️ Show Route'}
          </button>
        )}
      </div>

      {error ? (
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Configuration Required</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <a 
              href="https://console.cloud.google.com/apis/library" 
              target="_blank" 
              rel="noopener"
              className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition"
            >
              Configure API Key
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
              <p className="mt-2 text-sm text-gray-600 font-medium">Loading map...</p>
            </div>
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={13}
              mapId="traveler-map"
              gestureHandling="greedy"
              className="w-full h-full"
            >
              {locations.map((location, idx) => (
                <Marker
                  key={idx}
                  position={{ lat: location.lat, lng: location.lng }}
                  title={location.title}
                  label={{
                    text: `${idx + 1}`,
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              ))}
              {showDirections && locations.length > 1 && (
                <DirectionsRenderer locations={locations} />
              )}
            </Map>
          </APIProvider>
        )}
      </div>
      )}
    </div>
  );
}
