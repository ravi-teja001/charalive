import { useState, useEffect, useRef } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { FormCard } from '@/components/shared/FormCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { biomassSource } from '@/data/mockData';
import { createRawBiomassProcurement, getVehicles, getStockPoints, updateOldLocalRecordsEmail } from '@/services/api';
import { statesData, getDistrictsByState, getVillagesByDistrict } from '@/data/locations';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, Upload, Check, MapPin } from 'lucide-react';
import { swal } from '@/lib/swal';
import { toast } from 'sonner';
import './RawBiomassProcurement.mobile.css';
import { PhotoCapture } from '@/components/shared/PhotoCapture';

import Tesseract from 'tesseract.js';
import EXIF from 'exif-js';

/** Compress image data URL to reduce payload size and avoid 413. Max width 800px, JPEG 0.75. */
function compressImageDataUrl(dataUrl: string, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = w > maxWidth ? maxWidth / w : 1;
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        const out = canvas.toDataURL('image/jpeg', quality);
        resolve(out);
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function RawBiomassProcurement() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const isSavingRef = useRef(false); // Track if save is in progress
  const [locationLocked, setLocationLocked] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [tempWeightPhoto, setTempWeightPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
    // Update old local records with correct email when component loads
    updateOldLocalRecordsEmail();
  }, [user]);

  // Reload vehicles when page becomes visible/focused (e.g., user navigates back from Add Vendor page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Page became visible, reload vehicles to get any new ones added
        loadVehicles();
      }
    };

    const handleFocus = () => {
      if (user?.id) {
        // Window gained focus, reload vehicles
        loadVehicles();
      }
    };

    const handleVehiclesUpdated = () => {
      if (user?.id) {
        // Vehicles were updated in Add Vendor page, reload them
        console.log('🔄 Vehicles updated event received, reloading...');
        loadVehicles();
      }
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Listen for window focus
    window.addEventListener('focus', handleFocus);
    // Listen for custom vehicles-updated event from Add Vendor page
    window.addEventListener('vehicles-updated', handleVehiclesUpdated);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('vehicles-updated', handleVehiclesUpdated);
    };
  }, [user]);


  const loadVehicles = async () => {
    if (!user?.id) {
      return;
    }
    try {
      console.log('🚗 Loading vehicles for user:', user.id);
      const data = await getVehicles(user.id);
      console.log('✅ Vehicles loaded successfully:', data?.length || 0, 'vehicles');
      setVehicles(data);
    } catch (error: any) {
      console.error('❌ Error loading vehicles:', error);
      
      // Handle CORS/network errors gracefully - don't show user error in development
      if (error.message?.includes('CORS') || 
          error.message?.includes('Access-Control-Allow-Origin') ||
          error.message?.includes('Failed to fetch')) {
        console.warn('🔧 Development: CORS/Network error detected, using empty vehicles list');
        setVehicles([]);
      } else {
        // Only show error for non-CORS errors
        console.error('Non-CORS error loading vehicles:', error);
        setVehicles([]);
      }
    }
  };

  const loadRecords = async (resetToPageOne: boolean = false) => {
    try {
      setLoading(true);
      console.log('📥 ===== LOADING RECORDS =====');
      console.log('User:', user);
      console.log('User stockPointId:', user?.stockPointId);
      
      // For now, just load vehicles and set empty records
      // TODO: Implement proper record loading when API is ready
      console.log('📊 Loading records...');
      
      // Set empty records for now
      console.log('✅ Records loaded: 0 records');
      
    } catch (error: any) {
      console.error('❌ Error loading records:', error);
      
      // Handle CORS/network errors gracefully
      if (error.message?.includes('CORS') || 
          error.message?.includes('Access-Control-Allow-Origin') ||
          error.message?.includes('Failed to fetch')) {
        console.warn('🔧 Development: CORS/Network error detected, using empty records');
      } else {
        swal.error(`Error loading records: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      console.log('🏁 Records loading completed');
    }
  };

  const [source, setSource] = useState('');
  const [vehicleType, setVehicleType] = useState<'own' | 'vendor'>('vendor');
  const [vehicleId, setVehicleId] = useState('');
  const [ownVehicleNumber, setOwnVehicleNumber] = useState('');
  const [ownVehicleWeight, setOwnVehicleWeight] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [subDistrict, setSubDistrict] = useState('');
  const [actualVillage, setActualVillage] = useState('');
  
  // Get available districts and villages based on selections
  const availableDistricts = state ? getDistrictsByState(state) : [];
  const availableVillages = state && district ? getVillagesByDistrict(state, district) : [];
  const uniqueVillages = [...new Set(availableVillages)];
  
  // Reset district, sub district and village when state changes
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    setDistrict('');
    setSubDistrict('');
    setActualVillage('');
  };
  
  // Reset sub district and village when district changes
  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict);
    setSubDistrict('');
    setActualVillage('');
  };
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeightInput, setNetWeightInput] = useState(''); // Manual net weight input
  const [extractedNetWeight, setExtractedNetWeight] = useState<number | null>(null); // Store NET WT extracted from photo
  const [manualWeightEntry, setManualWeightEntry] = useState(false); // Toggle for manual weight entry
  const [vehiclePhotos, setVehiclePhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [weightPhoto, setWeightPhoto] = useState<string | null>(null);
  const [vehiclePhotoLats, setVehiclePhotoLats] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [vehiclePhotoLngs, setVehiclePhotoLngs] = useState<(number | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [vehiclePhotoDates, setVehiclePhotoDates] = useState<(Date | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [weightPhotoLat, setWeightPhotoLat] = useState<number | undefined>();
  const [weightPhotoLng, setWeightPhotoLng] = useState<number | undefined>();
  const [weightPhotoDate, setWeightPhotoDate] = useState<Date | undefined>();
  
  // Cotton Moisture States
  const [moisturePhoto, setMoisturePhoto] = useState<string | null>(null);
  const [moisturePhotoLat, setMoisturePhotoLat] = useState<number | undefined>();
  const [moisturePhotoLng, setMoisturePhotoLng] = useState<number | undefined>();
  const [moisturePhotoDate, setMoisturePhotoDate] = useState<Date | undefined>();
  const [moisturePercentage, setMoisturePercentage] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [geojsonData, setGeojsonData] = useState<any>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleWeight = vehicleType === 'own'
    ? parseFloat(ownVehicleWeight) || 0
    : selectedVehicle?.weight || 0;
  // Gross Weight comes from OCR extraction or manual input
  const grossWeightValue = extractedNetWeight !== null 
    ? (grossWeight || extractedNetWeight + vehicleWeight) // Use calculated gross if available
    : manualWeightEntry 
      ? parseFloat(netWeightInput) || 0
      : parseFloat(grossWeight) || 0;
  
  // Net Weight is calculated: Gross Weight - Vehicle Weight  
  const netWeight = Math.max(0, grossWeightValue - vehicleWeight);
  
  // Update grossWeight state when manual input changes
  useEffect(() => {
    if (manualWeightEntry) {
      const manualGross = parseFloat(netWeightInput) || 0;
      setGrossWeight(manualGross.toString());
    }
  }, [netWeightInput, manualWeightEntry]);

  const handleVehicleTypeChange = (value: string) => {
    console.log('🔄 Vehicle type changed to:', value);
    
    if (value === 'own') {
      setVehicleType('own');
      setVehicleId('');
      setOwnVehicleNumber('');
      setOwnVehicleWeight('');
      // Clear vendor data when switching to own
      setName('');
      setState('');
      setDistrict('');
      setSubDistrict('');
      setActualVillage('');
    } else {
      setVehicleType('vendor');
      setOwnVehicleNumber('');
      setOwnVehicleWeight('');
      
      // Auto-fill with first available vendor data
      console.log('📋 Available vehicles for auto-fill:', vehicles);
      
      if (vehicles.length > 0) {
        // Get the first available vehicle
        const firstVehicle = vehicles[0];
        console.log('🚗 Auto-selecting first vehicle:', firstVehicle);
        console.log('🔍 Complete vehicle object keys:', Object.keys(firstVehicle));
        console.log('📝 All vehicle data:', JSON.stringify(firstVehicle, null, 2));
        
        // Set the vehicle ID
        setVehicleId(firstVehicle.id);
        
        // Auto-fill all vendor data
        if (firstVehicle.name) {
          setName(firstVehicle.name);
          console.log('✅ Name auto-set:', firstVehicle.name);
        }
        
        if (firstVehicle.state) {
          setState(firstVehicle.state);
          console.log('✅ State auto-set:', firstVehicle.state);
        }
        
        // Auto-fill district
        const districtValue = firstVehicle.district || firstVehicle.district_name || firstVehicle.districtName || firstVehicle.District;
        if (districtValue) {
          setDistrict(districtValue);
          console.log('✅ District auto-set:', districtValue);
        }
        
        // Auto-fill sub district (use village field from vendor data)
        const subDistrictValue = firstVehicle.subDistrict || firstVehicle.sub_district || firstVehicle.subDistrictName || firstVehicle.village;
        if (subDistrictValue) {
          setSubDistrict(subDistrictValue);
          console.log('✅ Sub District auto-set:', subDistrictValue);
        }
        
        // Auto-fill village
        const villageValue = firstVehicle.village || firstVehicle.village_name || firstVehicle.villageName || firstVehicle.Village;
        if (villageValue) {
          setActualVillage(villageValue);
          console.log('✅ Village auto-set:', villageValue);
        }
        
        // Show success message
        swal.success(`Vendor data auto-filled: ${firstVehicle.name || 'Unknown name'} (${firstVehicle.vehicleNumber})`);
      } else {
        console.log('⚠️ No vehicles available for auto-fill');
        swal.warning('No vendor vehicles available. Please add vehicles first.');
        
        // Clear fields when no vehicles available
        setName('');
        setState('');
        setDistrict('');
        setSubDistrict('');
        setActualVillage('');
      }
    }
  };

  const handleVehicleChange = (value: string) => {
    console.log('🔍 Vehicle selected:', value);
    console.log('📋 Available vehicles:', vehicles);
    
    setVehicleId(value);
    
    // Auto-populate all vendor data from selected vehicle
    const vehicle = vehicles.find((v) => v.id === value);
    console.log('🚗 Found vehicle:', vehicle);
    
    if (vehicle) {
      console.log('🚗 Auto-populating vendor data:', vehicle);
      console.log('📝 Vehicle data structure:', {
        id: vehicle.id,
        vehicleNumber: vehicle.vehicleNumber,
        name: vehicle.name,
        state: vehicle.state,
        district: vehicle.district,
        village: vehicle.village,
        subDistrict: vehicle.subDistrict,
        weight: vehicle.weight
      });
      
      // Auto-fill name
      if (vehicle.name) {
        setName(vehicle.name);
        console.log('✅ Name set:', vehicle.name);
      } else {
        console.log('⚠️ No name found in vehicle data');
      }
      
      // Auto-fill state
      if (vehicle.state) {
        setState(vehicle.state);
        console.log('✅ State set:', vehicle.state);
      } else {
        console.log('⚠️ No state found in vehicle data');
      }
      
      // Auto-fill district
      if (vehicle.district) {
        setDistrict(vehicle.district);
        console.log('✅ District set:', vehicle.district);
      }
      
      // Auto-fill sub district
      const subDistrictValue = vehicle.subDistrict || vehicle.sub_district || vehicle.village;
      if (subDistrictValue) {
        setSubDistrict(subDistrictValue);
        console.log('✅ Sub District set:', subDistrictValue);
      }
      
      // Auto-fill village
      const villageValue = vehicle.village || vehicle.village_name || vehicle.villageName;
      if (villageValue) {
        setActualVillage(villageValue);
        console.log('✅ Village set:', villageValue);
      }
      
      // Show success message to user
      swal.success(`Vendor data auto-filled: ${vehicle.name || 'Unknown name'}`);
    } else {
      console.log('⚠️ No vehicle found with ID:', value);
      swal.error('Vehicle not found. Please try selecting again.');
    }
  };

  const handleVehiclePhotoCapture = (index: number) => (photoData: string, lat?: number, lng?: number) => {
    const newPhotos = [...vehiclePhotos];
    newPhotos[index] = photoData;
    setVehiclePhotos(newPhotos);
    
    const newDates = [...vehiclePhotoDates];
    newDates[index] = new Date();
    setVehiclePhotoDates(newDates);
    
    console.log(`📸 Vehicle photo ${index + 1} captured with GPS:`, { 
      lat, 
      lng, 
      hasGPS: !!(lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng)))
    });
    
    // Ensure GPS coordinates are valid numbers
    const validLat = lat != null && !isNaN(Number(lat)) && Number(lat) !== 0 ? Number(lat) : null;
    const validLng = lng != null && !isNaN(Number(lng)) && Number(lng) !== 0 ? Number(lng) : null;
    
    const newLats = [...vehiclePhotoLats];
    const newLngs = [...vehiclePhotoLngs];
    
    if (validLat != null && validLng != null) {
      // Store GPS from photo
      newLats[index] = validLat;
      newLngs[index] = validLng;
      setVehiclePhotoLats(newLats);
      setVehiclePhotoLngs(newLngs);
      
      // Automatically fill location fields and lock them (use first photo with GPS)
      if (index === 0 || (!latitude || !longitude)) {
        setLatitude(validLat.toString());
        setLongitude(validLng.toString());
        setLocationLocked(true);
      }
      
      console.log('✅ GPS coordinates saved:', { lat: validLat, lng: validLng });
      swal.success(`Photo ${index + 1} captured! GPS: ${validLat.toFixed(6)}, ${validLng.toFixed(6)}`);
    } else {
      console.warn('⚠️ Vehicle photo captured without valid GPS coordinates', { lat, lng });
      // Still set the photo even if GPS is missing
      newLats[index] = undefined;
      newLngs[index] = undefined;
      setVehiclePhotoLats(newLats);
      setVehiclePhotoLngs(newLngs);
    }
  };

  const handleVehiclePhotoClear = (index: number) => () => {
    const newPhotos = [...vehiclePhotos];
    newPhotos[index] = null;
    setVehiclePhotos(newPhotos);
    
    const newLats = [...vehiclePhotoLats];
    const newLngs = [...vehiclePhotoLngs];
    const newDates = [...vehiclePhotoDates];
    newLats[index] = undefined;
    newLngs[index] = undefined;
    newDates[index] = undefined;
    setVehiclePhotoLats(newLats);
    setVehiclePhotoLngs(newLngs);
    setVehiclePhotoDates(newDates);
    
    // If clearing the first photo and it had GPS, unlock location
    if (index === 0 && vehiclePhotoLats[0] != null && vehiclePhotoLngs[0] != null) {
      setLocationLocked(true);
      setLatitude('17.3850');
      setLongitude('78.4867');
    }
  };

  const handleWeightPhotoClear = () => {
    setWeightPhoto(null);
    setTempWeightPhoto(null);
    setWeightPhotoLat(undefined);
    setWeightPhotoLng(undefined);
    setWeightPhotoDate(undefined);
    setGrossWeight('');
    setExtractedNetWeight(null); // Clear extracted NET WT when clearing photo
    setNetWeightInput(''); // Clear manual net weight input
    setManualWeightEntry(false); // Reset to auto mode
  };

  const getCurrentLocation = async () => {
    try {
      // Show loading using toast
      const loadingToast = toast.loading('Getting your current location...');
      
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        });

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setLocationLocked(true); // Allow manual editing
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success(`Current location captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        
        console.log('✅ Current location captured:', { lat, lng });
      } else {
        throw new Error('Geolocation is not supported by this browser');
      }
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      
      let errorMessage = 'Failed to get location';
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS settings.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    }
  };

  const setKPHBLocation = () => {
    const lat = 17.5062;
    const lng = 78.3986;
    
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setLocationLocked(true); // Allow manual editing
    
    toast.success(`KPHB Phase 40 location set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    console.log('✅ KPHB location set:', { lat, lng });
  };

  const setMyExactLocation = () => {
    // You can update these coordinates to your exact location
    const lat = 17.5062; // <-- UPDATE THIS to your exact latitude
    const lng = 78.3986; // <-- UPDATE THIS to your exact longitude
    
    setLatitude(lat.toString());
    setLongitude(lng.toString());
    setLocationLocked(true); // Allow manual editing
    
    toast.success(`My exact location set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    console.log('✅ My exact location set:', { lat, lng });
  };

  const handleWeightPhotoCapture = async (photoData: string, lat?: number, lng?: number) => {
    setTempWeightPhoto(photoData);
    setWeightPhotoDate(new Date()); // Store capture date/time
    
    console.log('Weight photo captured with GPS:', { lat, lng, hasGPS: !!(lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) });
    
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      setWeightPhotoLat(lat);
      setWeightPhotoLng(lng);
      // Automatically fill location if not already set and lock it
      if (!latitude || !longitude) {
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setLocationLocked(true);
        swal.success(`GPS captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } else {
      console.warn('Weight photo captured without GPS coordinates');
    }
    
    // Skip OCR processing and go directly to manual entry
    console.log('📸 Photo captured, skipping OCR - going to manual entry');
    setManualWeightEntry(true);
    setNetWeightInput('');
    
    // Open dialog to enter weight values manually
    setWeightDialogOpen(true);
  };

  const handleMoisturePhotoCapture = async (photoData: string, lat?: number, lng?: number) => {
    setMoisturePhoto(photoData);
    setMoisturePhotoDate(new Date()); // Store capture date/time
    
    console.log('Moisture photo captured with GPS:', { lat, lng, hasGPS: !!(lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) });
    
    if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
      setMoisturePhotoLat(lat);
      setMoisturePhotoLng(lng);
      // Automatically fill location if not already set and lock it
      if (!latitude || !longitude) {
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        setLocationLocked(true);
        swal.success(`GPS captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } else {
      console.warn('Moisture photo captured without GPS coordinates');
    }
    
    swal.success('Moisture photo captured! Please enter the moisture percentage.');
  };

  const handleWeightValuesSubmit = () => {
    if (tempWeightPhoto) {
      setWeightPhoto(tempWeightPhoto);
      // Ensure GPS coordinates are preserved when saving weight photo
      // (they should already be set in handleWeightPhotoCapture)
      setWeightDialogOpen(false);
      setTempWeightPhoto(null);
      swal.success('Weight record photo saved!');
      console.log('Weight photo saved with GPS:', { 
        lat: weightPhotoLat, 
        lng: weightPhotoLng,
        date: weightPhotoDate 
      });
    }
  };

  const handleWeightDialogCancel = () => {
    setWeightDialogOpen(false);
    setTempWeightPhoto(null);
    setWeightPhotoLat(undefined);
    setWeightPhotoLng(undefined);
    setWeightPhotoDate(undefined);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous submissions
    if (loading || isSavingRef.current) {
      console.log('Already saving, ignoring duplicate submit');
      return;
    }
    
    // Quick validation - optimized
    const isVehicleValid = vehicleType === 'own' 
      ? (ownVehicleNumber && ownVehicleWeight)
      : vehicleId;
    
    const hasVehiclePhoto = vehiclePhotos.some(photo => photo != null);
    const netWtValue = parseFloat(netWeightInput) || 0;
    const moistureRequired = source === 'cotton_stalks' || source === 'chilli_stalks';
    const moistureValid = !moistureRequired || (moisturePhoto && moisturePercentage);
    
    // Auto-fix common issues
    // 1. Fix village if empty but subDistrict exists
    if (!village && subDistrict) {
      setVillage(subDistrict);
      console.log('🔧 Auto-fixed: Using subDistrict as village');
    }
    
    // 2. Fix moisture percentage if empty but photo exists
    if (moistureRequired && moisturePhoto && !moisturePercentage) {
      setMoisturePercentage('15'); // Default moisture percentage
      console.log('🔧 Auto-fixed: Set default moisture percentage to 15%');
    }
    
    // 3. Re-check validation after auto-fixes (use actualVillage - that's what the input binds to)
    const finalVillage = actualVillage?.trim() || village || subDistrict;
    const finalMoistureValid = !moistureRequired || (moisturePhoto && (moisturePercentage || '15'));
    
    console.log('� DEBUG: Form validation check:', {
      source,
      isVehicleValid,
      netWtValue,
      netWtValueValid: netWtValue > 0,
      hasVehiclePhoto,
      weightPhoto,
      moistureValid: finalMoistureValid,
      state,
      district,
      village: finalVillage,
      user: !!user,
      vehicleType,
      vehicleId,
      ownVehicleNumber,
      ownVehicleWeight
    });
    
    if (!source || !isVehicleValid || !netWtValue || netWtValue <= 0 || 
        !hasVehiclePhoto || !weightPhoto || !finalMoistureValid || 
        !state || !district || !finalVillage || !user) {
      console.error('❌ Validation failed:', {
        missingSource: !source,
        missingVehicle: !isVehicleValid,
        missingNetWt: !netWtValue,
        invalidNetWt: netWtValue <= 0,
        missingVehiclePhoto: !hasVehiclePhoto,
        missingWeightPhoto: !weightPhoto,
        missingMoisture: !finalMoistureValid,
        missingState: !state,
        missingDistrict: !district,
        missingVillage: !finalVillage,
        missingUser: !user
      });
      swal.error('Please fill all required fields');
      return;
    }

    // Quick stock point resolution
    const stockPointIdToUse = user.stockPointId || 'sp1';
    
    // Fast GPS resolution
    let finalLatitude: number | undefined;
    let finalLongitude: number | undefined;
    
    // Quick GPS check - first vehicle photo with GPS
    for (let i = 0; i < vehiclePhotos.length; i++) {
      const lat = vehiclePhotoLats[i];
      const lng = vehiclePhotoLngs[i];
      if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng)) && Number(lat) !== 0 && Number(lng) !== 0) {
        finalLatitude = Number(lat);
        finalLongitude = Number(lng);
        break;
      }
    }
    
    // Fallback to manual GPS
    if (!finalLatitude && latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude)) && Number(latitude) !== 0 && Number(longitude) !== 0) {
      finalLatitude = Number(latitude);
      finalLongitude = Number(longitude);
    }

    // Compress photos to avoid 413 Payload Too Large (proxy/server limits)
    setLoading(true);
    let compressedVehiclePhotos: string[] = [];
    let compressedWeightPhoto = weightPhoto;
    let compressedMoisturePhoto: string | null = moisturePhoto;
    try {
      const vehiclePhotosArray = vehiclePhotos.filter(photo => photo != null) as string[];
      compressedVehiclePhotos = await Promise.all(
        vehiclePhotosArray.map((p) => compressImageDataUrl(p))
      );
      compressedWeightPhoto = await compressImageDataUrl(weightPhoto);
      if (moisturePhoto) compressedMoisturePhoto = await compressImageDataUrl(moisturePhoto);
    } catch (e) {
      console.warn('Photo compression failed, using originals:', e);
      compressedVehiclePhotos = vehiclePhotos.filter((photo): photo is string => photo != null);
      compressedMoisturePhoto = moisturePhoto;
    }

    // Fast data creation (use compressed photos)
    const vehiclePhotoJson = compressedVehiclePhotos.length > 0 ? JSON.stringify(compressedVehiclePhotos) : null;
    
    const procurementData: any = {
      stockPointId: stockPointIdToUse,
      source: source as 'cotton_stalks' | 'chilli_stalks',
      vehicleNumber: vehicleType === 'own' ? ownVehicleNumber : selectedVehicle?.vehicleNumber || '',
      vehicleWeight,
      vehiclePhoto: vehiclePhotoJson || (compressedVehiclePhotos[0] || ''),
      grossWeight: parseFloat(netWeightInput) + parseFloat(vehicleWeight.toString()),
      weightRecordPhoto: compressedWeightPhoto,
      netWeight: parseFloat(netWeightInput),
      procurementDate: new Date(),
      createdBy: user?.id || undefined,
      locationLatitude: finalLatitude,
      locationLongitude: finalLongitude,
      geojsonData: geojsonData ? (typeof geojsonData === 'string' ? JSON.parse(geojsonData) : geojsonData) : null,
      name: name.trim() || undefined,
      state: state || undefined,
      district: district || undefined,
      village: (actualVillage?.trim() || village || subDistrict) || null,
      vehicleType: vehicleType || undefined,
    };
    
    // Add moisture if required (use compressed photo)
    if (moistureRequired) {
      procurementData.moisturePhoto = compressedMoisturePhoto;
      procurementData.moisturePercentage = parseFloat(moisturePercentage);
    }

    try {
      console.log('⚡ Fast save starting...');
      console.log('🔍 DEBUG: User data at save time:', { 
        user: user ? 'present' : 'missing', 
        userId: user?.id, 
        userEmail: user?.email,
        userRole: user?.role 
      });
      console.log('🔍 DEBUG: Procurement data being saved:', {
        stockPointId: stockPointIdToUse,
        source: procurementData.source,
        vehicleNumber: procurementData.vehicleNumber,
        createdBy: procurementData.createdBy,
        hasNetWeight: !!procurementData.netWeight
      });
      setLoading(true);
      isSavingRef.current = true;

      // Immediate user feedback
      toast.loading('Saving...', { duration: 500 });

      // Fast save call
      const savedRecord = await createRawBiomassProcurement(procurementData);
      console.log('✅ Record saved successfully:', savedRecord);
      
      // Immediate success feedback
      toast.dismiss();
      swal.success('Saved successfully!');
        
        // Clear states immediately
        isSavingRef.current = false;
        setLoading(false);
        
        // Fast form reset
        setSource('');
        setVehicleType('vendor');
        setVehicleId('');
        setOwnVehicleNumber('');
        setOwnVehicleWeight('');
        setGrossWeight('');
        setExtractedNetWeight(null);
        setNetWeightInput('');
        setVehiclePhotos([null, null, null, null]);
        setWeightPhoto(null);
        setVehiclePhotoLats([undefined, undefined, undefined, undefined]);
        setVehiclePhotoLngs([undefined, undefined, undefined, undefined]);
        setVehiclePhotoDates([undefined, undefined, undefined, undefined]);
        setWeightPhotoLat(undefined);
        setWeightPhotoLng(undefined);
        setWeightPhotoDate(undefined);
        setMoisturePhoto(null);
        setMoisturePhotoLat(undefined);
        setMoisturePhotoLng(undefined);
        setMoisturePhotoDate(undefined);
        setMoisturePercentage('');
        setLatitude('');
        setLongitude('');
        setGeojsonData(null);
        setLocationLocked(true);
        setName('');
        setState('');
        setDistrict('');
        setSubDistrict('');
        setActualVillage('');

        // Trigger dashboard refresh
        localStorage.setItem('dashboardRefreshNeeded', Date.now().toString());
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
        
        console.log('⚡ Fast save completed!');
        // Trigger storage event for cross-tab communication
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'dashboardRefreshNeeded',
          newValue: Date.now().toString()
        }));
        
        console.log('✅ Dashboard refresh event dispatched immediately after saving record');
    } catch (error: any) {
      console.error('❌ Error saving procurement:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        status: error?.status,
        statusText: error?.statusText
      });
      
      // Clear loading state and show error immediately
      isSavingRef.current = false;
      setLoading(false);
      toast.dismiss();
      
      // Show specific error messages with more details
      if (error?.message?.includes('CORS')) {
        swal.error('CORS Error: Please check API server CORS settings or network connectivity');
      } else if (error?.message?.includes('Network error')) {
        swal.error('Network Error: Please check your internet connection');
      } else if (error?.message?.includes('JWT') || error?.message?.includes('token')) {
        swal.error('Authentication Error: Please log in again');
      } else if (error?.message?.includes('created_by')) {
        swal.error('Database Error: created_by field issue - please try again');
      } else if (error?.message?.includes('413') || error?.message?.includes('Payload') || error?.message?.includes('Too large')) {
        swal.error('Save failed: Photos are too large. Try fewer photos or lower quality, then save again.');
      } else {
        swal.error(`Save failed: ${error?.message || 'Unknown error'}\n\nDetails: ${JSON.stringify(error)}`);
      }
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Raw Biomass Procurement"
        description="Record trip details and biomass weight"
      />

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Trip Details */}
          <FormCard title={<span className="text-primary">Trip Details</span>} description="Enter source and vehicle information">
            <div className="space-y-6">
              {/* Row 1: Source of Biomass and Type of Biomass */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source of Biomass */}
                <div className="space-y-2">
                  <Label>Source of Biomass *</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {biomassSource.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type of Biomass */}
                <div className="space-y-2">
                  <Label>Type of Biomass *</Label>
                  <Select
                    value={vehicleType}
                    onValueChange={handleVehicleTypeChange}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="own">Own</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Vehicle Number and Vehicle Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Number */}
                {vehicleType === 'own' && (
                  <div className="space-y-2">
                    <Label>Vehicle Number *</Label>
                    <Input
                      value={ownVehicleNumber}
                      onChange={(e) => setOwnVehicleNumber(e.target.value)}
                      placeholder="e.g., TS09XX1234"
                      className="h-12"
                    />
                  </div>
                )}

                {vehicleType === 'vendor' && (
                  <div className="space-y-2">
                    <Label>Vehicle Number *</Label>
                    <Select
                      value={vehicleId}
                      onValueChange={handleVehicleChange}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.vehicleNumber} ({v.weight} kg)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Vehicle Weight */}
                {vehicleType === 'own' && (
                  <div className="space-y-2">
                    <Label>Vehicle Weight (kg) *</Label>
                    <Input
                      type="number"
                      value={ownVehicleWeight}
                      onChange={(e) => setOwnVehicleWeight(e.target.value)}
                      placeholder="Enter weight in kg"
                      className="h-12"
                    />
                  </div>
                )}

                {vehicleType === 'vendor' && (
                  <div className="space-y-2">
                    <Label>Vehicle Weight (kg) *</Label>
                    <Input
                      type="number"
                      value={selectedVehicle?.weight ? selectedVehicle.weight : ''}
                      readOnly
                      placeholder="Vehicle weight will appear here"
                      className="h-12 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Name */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Owner/Driver name"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vehicle owner or driver name
                  </p>
                </div>
              </div>

              {/* Row 4: Location - State and District */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select value={state} onValueChange={handleStateChange}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesData.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select state
                  </p>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Select 
                    value={district} 
                    onValueChange={handleDistrictChange} 
                    disabled={!state}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={state ? "Select district" : "Select state first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDistricts.map((d) => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {state ? "Select district" : "Select state first"}
                  </p>
                </div>
              </div>

              {/* Row 5: Sub District and Village */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sub District */}
                <div className="space-y-2">
                  <Label>Sub District *</Label>
                  <Select 
                    value={subDistrict} 
                    onValueChange={setSubDistrict} 
                    disabled={!district || !state}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={district ? "Select sub district" : "Select district first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueVillages.map((v, index) => (
                        <SelectItem key={`${v}-${index}`} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {district ? "Select sub district" : "Select district first"}
                  </p>
                </div>

                {/* Village */}
                <div className="space-y-2">
                  <Label>Village</Label>
                  <Input
                    value={actualVillage}
                    onChange={(e) => setActualVillage(e.target.value)}
                    placeholder="Enter village name"
                    className="h-12"
                    disabled={!district || !state}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter village name (optional)
                  </p>
                </div>
              </div>

              {/* 9. Vehicle Photos with Biomass (4 photos) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Vehicle Photo with Biomass *</Label>
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      First photo required
                    </span>
                  </div>
                </div>
                
                {/* Photo Grid Layout */}
                <div className="space-y-4">
                  {/* Row 1: Photo 1 & Photo 2 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <Label className="text-sm font-medium">Photo 1 *</Label>
                      </div>
                      <PhotoCapture
                        key={0}
                        onCapture={handleVehiclePhotoCapture(0)}
                        onClear={handleVehiclePhotoClear(0)}
                        value={vehiclePhotos[0]}
                        showMetadata={true}
                        metadata={{
                          latitude: vehiclePhotoLats[0],
                          longitude: vehiclePhotoLngs[0],
                          date: vehiclePhotoDates[0],
                          name: name,
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <Label className="text-sm font-medium">Photo 2</Label>
                      </div>
                      <PhotoCapture
                        key={1}
                        onCapture={handleVehiclePhotoCapture(1)}
                        onClear={handleVehiclePhotoClear(1)}
                        value={vehiclePhotos[1]}
                        showMetadata={true}
                        metadata={{
                          latitude: vehiclePhotoLats[1],
                          longitude: vehiclePhotoLngs[1],
                          date: vehiclePhotoDates[1],
                          name: name,
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Photo 3 & Photo 4 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <Label className="text-sm font-medium">Photo 3</Label>
                      </div>
                      <PhotoCapture
                        key={2}
                        onCapture={handleVehiclePhotoCapture(2)}
                        onClear={handleVehiclePhotoClear(2)}
                        value={vehiclePhotos[2]}
                        showMetadata={true}
                        metadata={{
                          latitude: vehiclePhotoLats[2],
                          longitude: vehiclePhotoLngs[2],
                          date: vehiclePhotoDates[2],
                          name: name,
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          4
                        </div>
                        <Label className="text-sm font-medium">Photo 4</Label>
                      </div>
                      <PhotoCapture
                        key={3}
                        onCapture={handleVehiclePhotoCapture(3)}
                        onClear={handleVehiclePhotoClear(3)}
                        value={vehiclePhotos[3]}
                        showMetadata={true}
                        metadata={{
                          latitude: vehiclePhotoLats[3],
                          longitude: vehiclePhotoLngs[3],
                          date: vehiclePhotoDates[3],
                          name: name,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormCard>

          {/* Weight Details + Location grouped so the form doesn't feel endlessly long */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Weight Details */}
            <FormCard title={<span className="text-primary">Weight Details</span>} description="NET WT captured from receipt, Gross Weight calculated automatically">
              <div className="space-y-6">
                
                {/* NET WT Input - Single Entry Point */}
                <div className="space-y-2">
                  <Label>NET WT from Receipt (kg) *</Label>
                  <Input
                    type="number"
                    value={netWeightInput}
                    onChange={(e) => setNetWeightInput(e.target.value)}
                    placeholder="Enter NET WT from receipt"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter NET WT manually from receipt (Gross Weight will be calculated automatically)
                  </p>
                </div>

                {/* Weight Record Photo and Net Weight Display - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PhotoCapture
                    onCapture={handleWeightPhotoCapture}
                    value={weightPhoto}
                    showMetadata={true}
                    metadata={{
                      latitude: weightPhotoLat,
                      longitude: weightPhotoLng,
                      date: weightPhotoDate,
                      name: name,
                    }}
                  />

                  {/* Weight Display Summary */}
                  <div className="bg-muted rounded-xl p-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Vehicle Weight</span>
                      <span className="font-medium">{vehicleWeight.toLocaleString()} kg</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-foreground">NET WT</span>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xl font-bold text-primary">
                          {netWeightInput ? parseFloat(netWeightInput).toLocaleString() : '0'} kg
                        </span>
                                              </div>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Gross Weight</span>
                        <span className="font-display text-2xl font-bold text-primary">
                          {netWeightInput ? (parseFloat(netWeightInput) - parseFloat(vehicleWeight.toString())).toLocaleString() : '0'} Kg.
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        = NET WT ({netWeightInput ? parseFloat(netWeightInput).toLocaleString() : '0'} kg) - Vehicle Weight ({vehicleWeight.toLocaleString()} kg)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FormCard>

            {/* Moisture Section - Show for both cotton and chilli stalks */}
            {(source === 'cotton_stalks' || source === 'chilli_stalks') && (
              <FormCard 
                title={<span className="text-primary">{source === 'cotton_stalks' ? 'Cotton Moisture' : 'Chilli Moisture'}</span>} 
                description={`Capture ${source === 'cotton_stalks' ? 'cotton' : 'chilli'} moisture photo and enter moisture percentage`}
              >
                <div className="space-y-6">
                  {/* Moisture Photo and Value Entry - Side by Side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PhotoCapture
                      onCapture={handleMoisturePhotoCapture}
                      value={moisturePhoto}
                      showMetadata={true}
                      metadata={{
                        latitude: moisturePhotoLat,
                        longitude: moisturePhotoLng,
                        date: moisturePhotoDate,
                      }}
                    />
                    
                    {/* Moisture Value Entry */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Moisture Percentage (%) *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={moisturePercentage}
                          onChange={(e) => setMoisturePercentage(e.target.value)}
                          placeholder="Enter moisture percentage"
                          className="h-12"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter moisture content percentage from measurement device
                        </p>
                      </div>
                      
                      {/* Moisture Display Summary */}
                      <div className="bg-muted rounded-xl p-4 border-2 border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground">Moisture Content</span>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xl font-bold text-primary">
                              {moisturePercentage ? `${parseFloat(moisturePercentage).toFixed(1)}%` : '0.0%'}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {moisturePhoto 
                            ? `${source === 'cotton_stalks' ? 'Cotton' : 'Chilli'} moisture photo captured and value entered` 
                            : `Capture ${source === 'cotton_stalks' ? 'cotton' : 'chilli'} moisture photo and enter percentage`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FormCard>
            )}

            {/* Location */}
            <FormCard title={<span className="text-primary">Location</span>} description="Record location coordinates">
              <div className="space-y-6">
                <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude {locationLocked && <span className="text-xs text-muted-foreground">(Locked)</span>}</Label>
                    <Input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g., 17.9689"
                      className="h-12"
                      disabled={locationLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude {locationLocked && <span className="text-xs text-muted-foreground">(Locked)</span>}</Label>
                    <Input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g., 79.5941"
                      className="h-12"
                      disabled={locationLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMapDialogOpen(true)}
                      disabled={!latitude || !longitude}
                      className="flex items-center gap-2 h-12 w-full"
                    >
                      <MapPin className="h-4 w-4" />
                      View Map
                    </Button>
                  </div>
                </div>
                
                {latitude && longitude && (
                  <div className="text-sm text-muted-foreground">
                    Coordinates: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </div>
                )}
                
                {locationLocked && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                    <Check className="h-3 w-3" />
                    <span>Location locked from vehicle photo GPS data. Clear vehicle photos to edit.</span>
                  </div>
                )}
                </div>
              </div>
            </FormCard>
          </div>

        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? 'Saving...' : 'Save Procurement Data'}
          </Button>
        </div>
      </form>


      {/* Location Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Map
            </DialogTitle>
          </DialogHeader>
          {latitude && longitude ? (
            <div className="space-y-4 mt-4">
              <div className="bg-muted rounded-xl p-4 border border-border">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Latitude:</span> {parseFloat(latitude).toFixed(6)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Longitude:</span> {parseFloat(longitude).toFixed(6)}
                  </p>
                  <div className="mt-2 p-3 bg-background rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Coordinates:</p>
                    <p className="font-mono text-sm text-foreground break-all">
                      {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
              {/* Map Preview */}
              <div className="rounded-lg overflow-hidden border border-border w-full">
                <iframe
                  width="100%"
                  height="500"
                  style={{ border: 0, minHeight: '500px' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude) - 0.01},${parseFloat(latitude) - 0.01},${parseFloat(longitude) + 0.01},${parseFloat(latitude) + 0.01}&layer=mapnik&marker=${parseFloat(latitude)},${parseFloat(longitude)}`}
                />
                <div className="p-2 bg-background text-center">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${parseFloat(latitude)}&mlon=${parseFloat(longitude)}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View larger map on OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please enter latitude and longitude to view the map</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Weight Values Entry Dialog */}
      <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enter Weight Values from Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {tempWeightPhoto && (
              <div className="mb-4">
                <img
                  src={tempWeightPhoto}
                  alt="Weight Record"
                  className="w-full rounded-lg border border-border"
                  style={{ maxHeight: '40vh', objectFit: 'contain' }}
                />
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vehicle Weight (kg) *</Label>
                <Input
                  type="number"
                  value={vehicleType === 'own' ? ownVehicleWeight : (selectedVehicle?.weight?.toString() || '')}
                  readOnly
                  placeholder="Enter vehicle weight"
                  className="h-12 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label>Net WT (kg) *</Label>
                <Input
                  type="number"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="Enter gross weight from photo"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Extracted from receipt photo. You can edit if needed.
                </p>
              </div>
              <div className="bg-muted rounded-xl p-4 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">Total NET WT</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-2xl font-bold text-primary">
                      {netWeight.toLocaleString()} Kg. 
                    </span>
                    {extractedNetWeight !== null && (
                      <span className="text-xs text-muted-foreground italic">(from receipt)</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {extractedNetWeight !== null 
                    ? "Extracted from receipt photo (read-only)" 
                    : "= Gross Weight − Vehicle Weight"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleWeightDialogCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleWeightValuesSubmit}
              disabled={!grossWeight || (vehicleType === 'vendor' && !selectedVehicle?.weight) || (vehicleType === 'own' && !ownVehicleWeight)}
            >
              Save Weight Values
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );

}