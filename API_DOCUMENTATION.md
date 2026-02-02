# Biochar Management System API Documentation

## 🌐 Base URL
```
https://YOUR_PROJECT.supabase.co/rest/v1
```

## 🔑 Authentication
Include these headers in all requests:
```
apikey: YOUR_SUPABASE_ANON_KEY
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

## 📡 API Endpoints

### 1. Stock Points
**GET** `/stock_points`
- Returns: Array of all stock points
- Example: `curl -X GET "https://your-project.supabase.co/rest/v1/stock_points"`

### 2. Vehicles
**GET** `/vehicles`
- Returns: Array of all vehicles
- Example: `curl -X GET "https://your-project.supabase.co/rest/v1/vehicles"`

**POST** `/vehicles`
- Creates new vehicle
- Body: `{"vehicle_number": "TEST-001", "weight": 1000, "type": "registered"}`
- Example: `curl -X POST "https://your-project.supabase.co/rest/v1/vehicles" -d '{"vehicle_number": "TEST-001", "weight": 1000, "type": "registered"}'`

### 3. Raw Biomass Procurement
**GET** `/raw_biomass_procurement`
- Returns: Array of procurement records
- Query params: `?limit=5&order=created_at desc`
- Example: `curl -X GET "https://your-project.supabase.co/rest/v1/raw_biomass_procurement?limit=5"`

### 4. Expenses
**GET** `/expenses`
- Returns: Array of expense records
- Query params: `?limit=5&order=created_at desc`
- Example: `curl -X GET "https://your-project.supabase.co/rest/v1/expenses?limit=5"`

## 🧪 Quick Test Commands

```bash
# Test connection (replace with your values)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-anon-key"

# Test stock points
curl -X GET "$SUPABASE_URL/rest/v1/stock_points" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"

# Test vehicles
curl -X GET "$SUPABASE_URL/rest/v1/vehicles" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"

# Create test vehicle
curl -X POST "$SUPABASE_URL/rest/v1/vehicles" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"vehicle_number": "TEST-001", "weight": 1000, "type": "registered"}'
```

## 📱 Shareable Test Links

1. **HTML Test Page**: Open `shareable-api-test.html` in browser
2. **Direct API**: Use curl commands above
3. **Postman Collection**: Import endpoints manually

## ✅ Success Criteria

API is working if:
- ✅ Connection test passes
- ✅ Stock points return data (even empty array)
- ✅ Vehicles endpoint responds
- ✅ Can create new vehicle
- ✅ Procurement records are accessible

## 🚨 Common Issues

- **401 Unauthorized**: Check API key
- **404 Not Found**: Check URL and endpoint
- **500 Server Error**: Contact support
- **CORS Issues**: Use proper headers

## 📞 Support

For API issues, contact development team with:
- Error messages
- Request URL
- Response headers
- Timestamp
