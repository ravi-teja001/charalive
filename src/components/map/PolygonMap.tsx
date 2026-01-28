import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { environment } from '@/lib/environment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Settings, Trash2 } from 'lucide-react';
import { swal } from '@/lib/swal';

// Load token from localStorage or environment
const getMapboxToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('mapbox_token') || environment.mapboxToken || '';
  }
  return environment.mapboxToken || '';
};

interface PolygonMapProps {
  onPolygonChange: (geojson: any) => void;
  initialGeoJSON?: any;
  latitude?: number;
  longitude?: number;
}

export function PolygonMap({ onPolygonChange, initialGeoJSON, latitude, longitude }: PolygonMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [tokenInput, setTokenInput] = useState(() => getMapboxToken());
  const [hasToken, setHasToken] = useState(() => !!getMapboxToken());
  
  // Set token when component mounts
  useEffect(() => {
    const token = getMapboxToken();
    if (token) {
      mapboxgl.accessToken = token;
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !hasToken) return;

    const token = getMapboxToken();
    if (!token) {
      setHasToken(false);
      return;
    }

    mapboxgl.accessToken = token;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: longitude && latitude ? [longitude, latitude] : [79.5941, 17.9689], // Default to Telangana
      zoom: 13,
    });

    // Wait for map to load before adding draw control
    map.current.on('load', () => {
      // Initialize draw
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'draw_polygon',
        styles: [
          {
            'id': 'gl-draw-polygon-fill-inactive',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'paint': {
              'fill-color': '#ff0000',
              'fill-opacity': 0.3
            }
          },
          {
            'id': 'gl-draw-polygon-fill-active',
            'type': 'fill',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'paint': {
              'fill-color': '#ff0000',
              'fill-opacity': 0.5
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-inactive',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#ff0000',
              'line-width': 2
            }
          },
          {
            'id': 'gl-draw-polygon-stroke-active',
            'type': 'line',
            'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            'layout': {
              'line-cap': 'round',
              'line-join': 'round'
            },
            'paint': {
              'line-color': '#ff0000',
              'line-width': 3
            }
          }
        ]
      });

      map.current?.addControl(draw.current);

      // Load initial GeoJSON if provided
      if (initialGeoJSON) {
        try {
          draw.current?.add(initialGeoJSON);
        } catch (e) {
          console.error('Error loading initial GeoJSON:', e);
        }
      }

      // Handle polygon creation/update
      const handleDrawUpdate = () => {
        const data = draw.current?.getAll();
        if (data && data.features.length > 0) {
          const feature = data.features[0];
          // Style the polygon as red
          if (map.current && feature.geometry.type === 'Polygon') {
            onPolygonChange(feature);
          }
        } else {
          onPolygonChange(null);
        }
      };

      map.current?.on('draw.create', handleDrawUpdate);
      map.current?.on('draw.update', handleDrawUpdate);
      map.current?.on('draw.delete', handleDrawUpdate);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [hasToken, latitude, longitude, initialGeoJSON, onPolygonChange]);

  const handleTokenSave = () => {
    if (!tokenInput.trim()) {
      swal.error('Please enter a Mapbox token');
      return;
    }
    // Store token in localStorage (in production, use secure storage)
    if (typeof window !== 'undefined') {
      localStorage.setItem('mapbox_token', tokenInput);
    }
    mapboxgl.accessToken = tokenInput;
    setHasToken(true);
    setShowTokenDialog(false);
    swal.success('Mapbox token saved! Refreshing map...');
    // Reload page to reinitialize map
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleClearPolygon = () => {
    if (draw.current) {
      draw.current.deleteAll();
      onPolygonChange(null);
    }
  };

  if (!hasToken) {
    return (
      <>
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center bg-muted/50">
          <p className="text-muted-foreground mb-4">
            Mapbox token required to enable the map
          </p>
          <Button onClick={() => setShowTokenDialog(true)} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Enter Mapbox Token
          </Button>
        </div>

        <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Mapbox Token</DialogTitle>
              <DialogDescription>
                Get your free token from{' '}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  mapbox.com
                </a>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mapbox Access Token</Label>
                <Input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="pk.eyJ1Ijog..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleTokenSave}>Save Token</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Draw Polygon on Map</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearPolygon}
          disabled={!draw.current?.getAll().features.length}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Polygon
        </Button>
      </div>
      <div
        ref={mapContainer}
        className="w-full h-[400px] rounded-lg border border-border overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      <p className="text-xs text-muted-foreground">
        Click on the map to start drawing. The polygon will be displayed in red.
      </p>
    </div>
  );
}
