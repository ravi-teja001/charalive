import { useState, useRef } from 'react';
import { Camera, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PhotoWithMetadata } from './PhotoWithMetadata';
import { swal } from '@/lib/swal';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import EXIF from 'exif-js';

interface PhotoCaptureProps {
  onCapture: (photoData: string, latitude?: number, longitude?: number) => void;
  onClear?: () => void;
  value?: string | null;
  showMetadata?: boolean;
  metadata?: {
    latitude?: number;
    longitude?: number;
    date?: Date | string;
    name?: string;
  };
}

export function PhotoCapture({ onCapture, onClear, value, showMetadata = false, metadata }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [capturedLocation, setCapturedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract GPS from EXIF data in image
  const extractGPSFromEXIF = (file: File): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      EXIF.getData(file as any, function() {
        try {
          const lat = EXIF.getTag(this, 'GPSLatitude');
          const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
          const lng = EXIF.getTag(this, 'GPSLongitude');
          const lngRef = EXIF.getTag(this, 'GPSLongitudeRef');

          if (lat && lng) {
            // Convert EXIF GPS format (degrees, minutes, seconds) to decimal
            const latDecimal = convertDMSToDD(lat, latRef);
            const lngDecimal = convertDMSToDD(lng, lngRef);
            
            if (latDecimal && lngDecimal) {
              resolve({
                lat: latDecimal,
                lng: lngDecimal,
              });
              return;
            }
          }
        } catch (error) {
          console.warn('EXIF parsing error:', error);
        }
        resolve(null);
      });
    });
  };

  // Convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
  const convertDMSToDD = (dms: number[], ref: string): number | null => {
    if (!dms || dms.length !== 3) return null;
    
    let dd = dms[0] + dms[1] / 60 + dms[2] / (60 * 60);
    if (ref === 'S' || ref === 'W') {
      dd = dd * -1;
    }
    return dd;
  };

  // Get current location using Capacitor or browser API
  const getCurrentLocation = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      const hasGeolocation = Capacitor.isPluginAvailable('Geolocation');
      
      console.log('📍 GPS capture attempt:', { 
        isNative, 
        hasGeolocation, 
        platform,
        userAgent: navigator.userAgent 
      });
      
      // Try Capacitor Geolocation first (for mobile apps)
      if (isNative && hasGeolocation) {
        try {
          // Always check permissions first
          console.log('🔍 Checking location permissions...');
          let permissionStatus;
          try {
            permissionStatus = await Geolocation.checkPermissions();
            console.log('📋 Location permission status:', permissionStatus);
          } catch (permError: any) {
            console.warn('⚠️ Error checking permissions:', permError);
            permissionStatus = { location: 'prompt' };
          }
          
          // Request permissions if not granted
          if (!permissionStatus || permissionStatus.location !== 'granted') {
            console.log('🔐 Requesting location permissions...');
            try {
              const requestResult = await Geolocation.requestPermissions();
              console.log('📝 Permission request result:', requestResult);
              
              if (!requestResult) {
                console.error('❌ No permission result returned');
                swal.error('Location permission request failed. Please enable it in app settings.');
                return null;
              }
              
              // Handle different permission states
              const locationPerm = requestResult.location || requestResult.permissions?.location;
              
              if (locationPerm === 'denied' || locationPerm === 'prompt') {
                console.warn('⚠️ Location permission not granted:', locationPerm);
                swal.error('Location permission is required. Please enable it in Android Settings → Apps → Biochar Management System → Permissions → Location.');
                return null;
              }
              
              if (locationPerm !== 'granted') {
                console.warn('⚠️ Location permission status:', locationPerm);
                swal.error('Location permission not granted. Please enable it in app settings.');
                return null;
              }
              
              console.log('✅ Location permission granted');
            } catch (reqError: any) {
              console.error('❌ Error requesting permissions:', reqError);
              swal.error(`Could not request location permission: ${reqError.message || 'Unknown error'}. Please enable it manually in Android Settings.`);
              return null;
            }
          } else {
            console.log('✅ Location permission already granted');
          }
          
          // Wait a bit for permissions to fully register (Android sometimes needs this)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get current position with longer timeout for mobile
          console.log('🌐 Attempting to get GPS position via Capacitor Geolocation...');
          console.log('⏱️ Timeout: 30 seconds, High Accuracy: true');
          
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000, // Increased to 30 seconds for Android
            maximumAge: 0, // Always get fresh location
          });
          
          if (position && position.coords) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log('✅ GPS captured via Capacitor:', {
              lat,
              lng,
              accuracy: `${accuracy}m`,
              platform
            });
            
            // Validate coordinates
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
              console.warn('⚠️ Invalid GPS coordinates received');
              swal.error('Invalid GPS coordinates. Please try again.');
              return null;
            }
            
            return {
              lat,
              lng,
            };
          } else {
            console.error('❌ No position or coordinates received from Capacitor');
            return null;
          }
        } catch (error: any) {
          console.error('❌ Capacitor Geolocation error:', error);
          console.error('Error details:', {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
          });
          
          // GPS is optional - don't show errors to user
          console.log('GPS unavailable, continuing without location:', error.message);
          
          // Don't return null yet - fall through to browser geolocation as backup
        }
      }
      
      // Fallback to browser geolocation
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('GPS captured via browser:', {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn('Browser Geolocation error:', error);
              if (error.code === error.PERMISSION_DENIED) {
                swal.error('Location permission denied. Please enable location access in browser settings.');
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                swal.error('Location unavailable. Please check your GPS settings.');
              } else if (error.code === error.TIMEOUT) {
                swal.error('Location request timed out. Please try again.');
              }
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000, // Increased timeout
              maximumAge: 0,
            }
          );
        });
      }
    } catch (error) {
      console.error('Location error:', error);
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Step 1: Read file and show preview immediately
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setPreview(result);
      setShowDialog(true);
      
      // Step 2: Try multiple methods to get location (CRITICAL for mobile)
      let location: { lat: number; lng: number } | null = null;
      
      console.log('📸 File selected, starting GPS capture process...');
      console.log('🔍 Is native platform:', Capacitor.isNativePlatform());
      console.log('🔍 Platform:', Capacitor.getPlatform());
      
      // Method 1: Try to extract from EXIF (if available in image)
      console.log('📍 Method 1: Attempting to extract GPS from EXIF...');
      try {
        const exifLocation = await extractGPSFromEXIF(file);
        if (exifLocation && exifLocation.lat && exifLocation.lng && 
            !isNaN(exifLocation.lat) && !isNaN(exifLocation.lng) &&
            exifLocation.lat !== 0 && exifLocation.lng !== 0) {
          location = exifLocation;
          setCapturedLocation(location);
          console.log('✅ GPS extracted from EXIF:', location);
          toast.success(`Location from image: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
        } else {
          console.log('⚠️ EXIF GPS not found or invalid, trying device GPS...');
        }
      } catch (exifError) {
        console.warn('⚠️ EXIF extraction failed:', exifError);
      }
      
      // Method 2: Get current GPS location (ALWAYS try this for mobile, even if EXIF succeeded)
      // On mobile, device GPS is often more accurate than EXIF
      if (!location || Capacitor.isNativePlatform()) {
        console.log('📍 Method 2: Attempting device GPS capture...');
        
        const isNative = Capacitor.isNativePlatform();
        const loadingMessage = isNative 
          ? 'Capturing GPS location (30 sec timeout)...' 
          : 'Getting GPS location...';
        
        const loadingToastId = toast.loading(loadingMessage, { 
          id: 'gps-loading-file',
          duration: isNative ? 35000 : 15000
        });
        
        try {
          console.log('🌐 Calling getCurrentLocation()...');
          const currentLocation = await getCurrentLocation();
          toast.dismiss('gps-loading-file');
          
          if (currentLocation && currentLocation.lat && currentLocation.lng) {
            // Validate coordinates are valid numbers and not zero
            const lat = Number(currentLocation.lat);
            const lng = Number(currentLocation.lng);
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              location = { lat, lng };
              setCapturedLocation(location);
              console.log('✅ GPS captured from device:', location);
              toast.success(`GPS captured: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
            } else {
              console.error('❌ GPS coordinates invalid:', { lat, lng, isNaNLat: isNaN(lat), isNaNLng: isNaN(lng) });
              if (isNative) {
                swal.error('Invalid GPS. Ensure:\n1. GPS is enabled\n2. Location permission granted\n3. Try again');
              }
            }
          } else {
            console.error('❌ getCurrentLocation returned null or invalid:', currentLocation);
            if (isNative) {
              swal.error('GPS not available. Please:\n1. Enable GPS in Settings\n2. Grant Location permission\n3. Try again');
            } else {
              swal.error('Location not available. Enable location permissions.');
            }
          }
        } catch (gpsError: any) {
          toast.dismiss('gps-loading-file');
          console.error('❌ GPS capture exception:', gpsError);
          console.error('Error details:', {
            message: gpsError.message,
            code: gpsError.code,
            name: gpsError.name,
            stack: gpsError.stack
          });
          
          // GPS is optional - don't show errors to user
          console.log('GPS fallback failed, continuing without location:', gpsError.message);
        }
      }
      
      // Log final GPS status
      console.log('📊 Final GPS status after file select:', {
        hasLocation: !!location,
        location,
        hasCapturedLocation: !!capturedLocation,
        capturedLocation
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (preview) {
      // Use captured location or fallback to metadata
      const latToCapture = capturedLocation?.lat ?? metadata?.latitude;
      const lngToCapture = capturedLocation?.lng ?? metadata?.longitude;
      
      console.log('Confirming photo with GPS:', { 
        lat: latToCapture, 
        lng: lngToCapture,
        hasCapturedLocation: !!capturedLocation,
        hasMetadataGPS: !!(metadata?.latitude && metadata?.longitude)
      });
      
      // Always pass GPS if available, even if it's undefined
      console.log('📤 Calling onCapture with:', {
        hasPreview: !!preview,
        lat: latToCapture,
        lng: lngToCapture,
        latType: typeof latToCapture,
        lngType: typeof lngToCapture,
        latValid: latToCapture != null && !isNaN(Number(latToCapture)) && Number(latToCapture) !== 0,
        lngValid: lngToCapture != null && !isNaN(Number(lngToCapture)) && Number(lngToCapture) !== 0
      });
      onCapture(preview, latToCapture, lngToCapture);
      setShowDialog(false);
      setPreview(null);
      // Don't clear capturedLocation if we're re-using metadata
      if (!metadata?.latitude || !metadata?.longitude) {
        setCapturedLocation(null);
      }
      
      if (latToCapture && lngToCapture) {
        toast.success(`Photo captured successfully! GPS: ${latToCapture.toFixed(4)}, ${lngToCapture.toFixed(4)}`);
      } else {
        toast.success('Photo captured successfully');
      }
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPreview(null);
    setCapturedLocation(null);
  };

  return (
    <>
      <div className="space-y-2">
        {!value ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors p-6"
          >
            <Camera className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Tap to capture photo
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-success border border-border rounded-xl p-4">
              <Check size={24} />
              <span className="font-medium">Photo captured</span>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                Retake Image
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1"
                onClick={() => {
                  // For weight photos, check if there's a temp photo (newly captured) or use the stored value
                  const imageToPreview = preview || value;
                  setPreview(imageToPreview);
                  
                  // Restore captured location from metadata if available
                  if (metadata?.latitude != null && metadata?.longitude != null && 
                      !isNaN(Number(metadata.latitude)) && !isNaN(Number(metadata.longitude))) {
                    setCapturedLocation({
                      lat: Number(metadata.latitude),
                      lng: Number(metadata.longitude),
                    });
                    console.log('Restored GPS from metadata for preview:', { 
                      lat: metadata.latitude, 
                      lng: metadata.longitude 
                    });
                  } else {
                    console.log('No GPS metadata available for preview');
                  }
                  setShowDialog(true);
                }}
              >
                Preview
              </Button>
              {onClear && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        onClick={async (e) => {
          // On mobile, proactively request GPS permissions AND capture location when camera is opened
          if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Geolocation')) {
            console.log('📸 Camera button clicked - proactively getting GPS...');
            try {
              const permissionStatus = await Geolocation.checkPermissions();
              console.log('📋 Current permission status:', permissionStatus);
              
              if (!permissionStatus || permissionStatus.location !== 'granted') {
                console.log('🔐 Requesting GPS permissions proactively...');
                try {
                  const requestResult = await Geolocation.requestPermissions();
                  console.log('📝 Permission request result:', requestResult);
                  
                  const locationPerm = requestResult?.location || requestResult?.permissions?.location;
                  
                  if (locationPerm === 'granted') {
                    console.log('✅ Permissions granted, waiting 800ms for GPS hardware to initialize...');
                    await new Promise(resolve => setTimeout(resolve, 800)); // Increased delay for Android
                    
                    // Get location proactively with retry logic
                    let retries = 2;
                    while (retries > 0) {
                      try {
                        console.log(`🌐 Attempting proactive GPS capture (${3 - retries}/3)...`);
                        const currentLocation = await getCurrentLocation();
                        if (currentLocation && currentLocation.lat && currentLocation.lng) {
                          const lat = Number(currentLocation.lat);
                          const lng = Number(currentLocation.lng);
                          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                            setCapturedLocation({ lat, lng });
                            console.log('✅ Proactive GPS captured:', { lat, lng });
                            toast.success(`GPS ready: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                            break; // Success, exit retry loop
                          }
                        }
                      } catch (locError: any) {
                        console.warn(`⚠️ Proactive GPS attempt failed:`, locError);
                        retries--;
                        if (retries > 0) {
                          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
                        }
                      }
                    }
                  } else {
                    console.warn('⚠️ Permission not granted:', locationPerm);
                    swal.error('Location permission required. Enable it in Settings.');
                  }
                } catch (permError: any) {
                  console.warn('⚠️ Error requesting permissions proactively:', permError);
                  swal.error('Could not request location permission. Enable manually in Settings.');
                }
              } else {
                // Permissions already granted, try to get location proactively
                console.log('✅ Permissions already granted, getting location proactively...');
                try {
                  const currentLocation = await getCurrentLocation();
                  if (currentLocation && currentLocation.lat && currentLocation.lng) {
                    const lat = Number(currentLocation.lat);
                    const lng = Number(currentLocation.lng);
                    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                      setCapturedLocation({ lat, lng });
                      console.log('✅ Proactive GPS captured (permissions already granted):', { lat, lng });
                      toast.success(`GPS ready: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    }
                  }
                } catch (locError: any) {
                  console.warn('⚠️ Proactive GPS capture failed:', locError);
                  // Don't show error toast here - will try again when photo is selected
                }
              }
            } catch (error: any) {
              console.warn('⚠️ Could not check GPS permissions before camera:', error);
              // Continue anyway, will request again during capture
            }
          }
        }}
        className="hidden"
      />

      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        } else {
          setShowDialog(true);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirm Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {preview ? (
              <div className="space-y-2 overflow-hidden">
                {showMetadata && metadata ? (
                  <div className="max-h-[calc(90vh-140px)] overflow-auto">
                    <PhotoWithMetadata
                      src={preview}
                      latitude={capturedLocation?.lat ?? metadata?.latitude ?? undefined}
                      longitude={capturedLocation?.lng ?? metadata?.longitude ?? undefined}
                      date={metadata?.date || new Date()}
                      name={metadata?.name}
                      alt="Preview"
                      className="w-full"
                    />
                  </div>
                ) : (
                  <>
                    <div className="max-h-[calc(90vh-140px)] overflow-auto">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full rounded-lg border border-border"
                        style={{ maxHeight: '100%', objectFit: 'contain', width: '100%' }}
                      />
                    </div>
                    {capturedLocation && (
                      <p className="text-xs text-muted-foreground">
                        Location: {capturedLocation.lat.toFixed(6)}, {capturedLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No photo selected</p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Select Photo
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            {preview && (
              <Button onClick={handleConfirm}>Use This Photo</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
