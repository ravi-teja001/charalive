#!/bin/bash

# API Testing Commands - Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_KEY

SUPABASE_URL="YOUR_SUPABASE_URL"
SUPABASE_KEY="YOUR_SUPABASE_KEY"

echo "🧪 Testing Supabase API Online..."
echo "URL: $SUPABASE_URL"
echo ""

# Test 1: Get Stock Points
echo "📍 Testing GET Stock Points..."
curl -X GET "$SUPABASE_URL/rest/v1/stock_points" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 2: Get Vehicles
echo "🚚 Testing GET Vehicles..."
curl -X GET "$SUPABASE_URL/rest/v1/vehicles" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json"
echo ""
echo ""

# Test 3: Create Test Vehicle
echo "➕ Testing POST Vehicle..."
curl -X POST "$SUPABASE_URL/rest/v1/vehicles" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_number": "TEST-001",
    "weight": 1000,
    "type": "registered"
  }'
echo ""
echo ""

# Test 4: Get Raw Biomass Procurement
echo "🌾 Testing GET Raw Biomass Procurement..."
curl -X GET "$SUPABASE_URL/rest/v1/raw_biomass_procurement?limit=5" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json"
echo ""
echo ""

echo "✅ API Testing Complete!"
