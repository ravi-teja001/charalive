import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

interface PhotoWithMetadataProps {
  src: string;
  latitude?: number;
  longitude?: number;
  date?: Date | string;
  name?: string;
  alt?: string;
  className?: string;
}

interface LocationData {
  location: string;
  address: string;
  country: string;
}

export function PhotoWithMetadata({
  src,
  latitude,
  longitude,
  date,
  name,
  alt = 'Photo',
  className = '',
}: PhotoWithMetadataProps) {
  const [imageError, setImageError] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  console.log('🖼️ PhotoWithMetadata received props:', { src, latitude, longitude, date, name });

  const displayDate = date 
    ? format(new Date(date), 'EEEE, dd/MM/yyyy hh:mm a')
    : format(new Date(), 'EEEE, dd/MM/yyyy hh:mm a');

  // Reverse geocoding to get location details
  useEffect(() => {
    const fetchLocationData = async () => {
      if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
        console.log('📍 Starting reverse geocoding for:', { latitude, longitude });
        setLoadingLocation(true);
        
        // MOCK DATA FALLBACK FOR DEVELOPMENT
        const lat = Number(latitude);
        const lon = Number(longitude);
        
        // Check if coordinates match our mock data (wider ranges for better matching)
        // But allow real GPS coordinates to pass through to actual geocoding
        if ((lat >= 17.38 && lat <= 17.39 && lon >= 78.48 && lon <= 78.49) || // Gachibowli: 17.3850, 78.4867
            (lat >= 17.43 && lat <= 17.44 && lon >= 78.40 && lon <= 78.41) || // Madhapur: 17.4320, 78.4070
            (lat >= 16.78 && lat <= 16.79 && lon >= 79.96 && lon <= 79.97) || // Chinthala Palem: 16.788347, 79.962687
            (lat >= 17.36 && lat <= 17.37 && lon >= 78.38 && lon <= 78.39)) { // Kukatpally: 17.369368, 78.381673
          
          // ONLY USE MOCK FOR OUR EXACT MOCK COORDINATES, NOT FOR REAL GPS
          const isMockCoordinate = 
            (Math.abs(lat - 17.3850) < 0.001 && Math.abs(lon - 78.4867) < 0.001) || // Gachibowli
            (Math.abs(lat - 17.4320) < 0.001 && Math.abs(lon - 78.4070) < 0.001) || // Madhapur  
            (Math.abs(lat - 16.788347) < 0.001 && Math.abs(lon - 79.962687) < 0.001) || // Chinthala Palem
            (Math.abs(lat - 17.369368) < 0.001 && Math.abs(lon - 78.381673) < 0.001) || // Kukatpally
            (Math.abs(lat - 17.5062) < 0.001 && Math.abs(lon - 78.3986) < 0.001); // KPHB Phase 40
          
          if (isMockCoordinate) {
            console.log('🧪 Using mock location data for coordinates:', lat, lon);
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (Math.abs(lat - 17.3850) < 0.001 && Math.abs(lon - 78.4867) < 0.001) {
              // Gachibowli location: 17.3850, 78.4867
              setLocationData({
                location: 'Gachibowli, Telangana, India',
                address: 'Hitech City Road, Gachibowli, Hyderabad, Telangana 500032, India',
                country: 'India'
              });
            } else if (Math.abs(lat - 17.4320) < 0.001 && Math.abs(lon - 78.4070) < 0.001) {
              // Madhapur location: 17.4320, 78.4070
              setLocationData({
                location: 'Madhapur, Telangana, India',
                address: 'Hitech City Road, Madhapur, Hyderabad, Telangana 500081, India',
                country: 'India'
              });
            } else if (Math.abs(lat - 16.788347) < 0.001 && Math.abs(lon - 79.962687) < 0.001) {
              // Chinthala Palem location: 16.788347, 79.962687
              setLocationData({
                location: 'Chinthala Palem, Telangana, India',
                address: 'Mallareddy Gudem - Mellacheruvu Rd, Chinthala Palem, Telangana 508246, India',
                country: 'India'
              });
            } else if (Math.abs(lat - 17.5062) < 0.001 && Math.abs(lon - 78.3986) < 0.001) {
              // KPHB Phase 40 location: 17.5062, 78.3986
              setLocationData({
                location: 'KPHB Phase 40, Kukatpally, Telangana, India',
                address: 'KPHB Phase 40, Kukatpally, Hyderabad, Telangana 500072, India',
                country: 'India'
              });
            } else {
              // Kukatpally location: 17.369368, 78.381673
              setLocationData({
                location: 'Kukatpally, Telangana, India',
                address: 'KPHB Road, Kukatpally, Hyderabad, Telangana 500072, India',
                country: 'India'
              });
            }
            setLoadingLocation(false);
            return;
          }
        }
        
        try {
          // Using Nominatim reverse geocoding (free OpenStreetMap service)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'BiocharManagementSystem/1.0'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            console.log('📍 Geocoding response:', data);
            
            // Extract location components
            const village = data.address?.village || data.address?.hamlet || data.address?.suburb || data.address?.town || '';
            const district = data.address?.county || data.address?.district || '';
            const state = data.address?.state || '';
            const country = data.address?.country || '';
            const postcode = data.address?.postcode || '';
            
            // Format location like the example: "Chinthala Palem, Telangana, India"
            const locationParts = [village, state, country].filter(Boolean);
            const location = locationParts.length > 0 ? locationParts.join(', ') : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            // Format address like the example: "Mallareddy Gudem - Mellacheruvu Rd, Chinthala Palem, Telangana 508246, India"
            const road = data.address?.road || data.address?.primary || '';
            const addressParts = [road, village, state, postcode, country].filter(Boolean);
            const address = addressParts.length > 0 ? addressParts.join(', ') : `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setLocationData({
              location,
              address,
              country
            });
            
            console.log('📍 Processed location data:', { location, address, country });
          } else {
            console.warn('📍 Geocoding failed with status:', response.status);
            // Set fallback data
            setLocationData({
              location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              address: `GPS Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`,
              country: 'Unknown'
            });
          }
        } catch (error) {
          console.warn('📍 Failed to fetch location data:', error);
          // Set fallback data on error
          setLocationData({
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            address: `GPS Coordinates: ${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`,
            country: 'Unknown'
          });
        } finally {
          setLoadingLocation(false);
        }
      }
    };

    fetchLocationData();
  }, [latitude, longitude]);

  // Get country flag emoji
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'India': '🇮🇳',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
    };
    return flags[country] || '';
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ maxWidth: '100%', position: 'relative' }}>
      {!imageError && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full rounded-lg"
          style={{ 
            objectFit: 'contain', 
            maxWidth: '100%', 
            height: 'auto',
            display: 'block',
            maxHeight: '100%'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="p-12 text-center bg-muted rounded-lg">
          <svg className="h-12 w-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-muted-foreground">Image could not be loaded</p>
        </div>
      )}
      
      {/* GPS Overlay - Always show enhanced format */}
      {(latitude != null || longitude != null || date || name) && (
        <div 
          className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2.5 shadow-lg border border-gray-200 z-10"
          style={{ 
            maxWidth: 'calc(100% - 1rem)',
            minWidth: '250px'
          }}
        >
          <div className="text-xs space-y-1.5 text-gray-800">
            {/* Coordinates - Bold main coordinates */}
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <MapPin className="w-3 h-3 text-green-600" />
              <span>
                {latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
                  ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
                  : 'Coordinates: N/A'
                }
              </span>
              {locationData?.country && (
                <span className="ml-1">{getCountryFlag(locationData.country)}</span>
              )}
            </div>
            
            {/* Address line - Show location address when available */}
            <div className="text-gray-700 text-[10px] leading-tight">
              {locationData?.address 
                ? locationData.address 
                : `GPS: ${latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))
                    ? `${Number(latitude).toFixed(6)}°, ${Number(longitude).toFixed(6)}°`
                    : 'N/A'
                  }`
              }
            </div>
            
            {/* Separate Latitude and Longitude lines */}
            {latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude)) && (
              <div className="text-[10px] text-gray-600">
                <div>Latitude: {Number(latitude).toFixed(6)}°</div>
                <div>Longitude: {Number(longitude).toFixed(6)}°</div>
              </div>
            )}
            
            {/* Date and Time - Always show */}
            <div className="text-[10px] text-gray-600 font-medium">
              {displayDate} GMT +05:30
            </div>
            
            {/* Loading indicator */}
            {loadingLocation && (
              <div className="text-[10px] text-blue-600 italic">
                Loading location details...
              </div>
            )}
            
            {/* Note/Name */}
            {name && (
              <div className="text-[10px] text-gray-500 italic">
                {name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
