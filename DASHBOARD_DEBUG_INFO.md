# Dashboard Stats Debugging Guide

## Why Dashboard Values Might Not Show

The Dashboard shows **TODAY'S records only**. If you saved records on previous days, they won't appear.

## How to Debug

### 1. Check Console Logs

Open browser DevTools (F12) and check the Console tab. Look for messages starting with:
- `📊 Dashboard loading data for user:`
- `📊 All user trips found:`
- `📊 Today trips found:`
- `⚠️ No trips found for today`

### 2. Check Record Dates

The logs will show:
- What date is being checked (today's date)
- What dates your records have
- If they match

### 3. Common Issues

#### Issue 1: Records from Different Days
**Problem**: Records saved on previous days won't show in dashboard  
**Solution**: Dashboard is working correctly - it shows only TODAY's stats

#### Issue 2: Timezone Mismatch
**Problem**: Dates saved in one timezone, compared in another  
**Solution**: Fixed in latest update - now compares both local and UTC dates

#### Issue 3: User ID Mismatch
**Problem**: Records not linked to your user ID  
**Check**: Console will show if trips are found but filtered out

#### Issue 4: Stock Point ID Mismatch
**Problem**: Records linked to different stock point  
**Check**: Console logs show which stock point is being queried

## Quick Fix Test

1. **Save a NEW record TODAY** - fill all fields and save
2. **Go to Dashboard immediately** - it should show the new record
3. **Check console logs** - you'll see if the record is found

## Expected Console Output (Success)

```
📊 Dashboard loading data for user: {id: "...", role: "supervisor_stockpoint"}
📊 All user trips found: 5
📊 Filtering trips for today: 2025-01-18
✅ Trip matches today: {id: "...", dateLocal: "2025-01-18", netWeight: 5000}
📊 Today trips found: 1
📊 Net weight today: 5000
```

## If Still Not Working

1. **Check your user ID**: Console logs show the user ID being used
2. **Check record dates**: Logs show what dates your records have
3. **Verify records exist**: Go to Raw Biomass Procurement page - do you see your records there?

## Dashboard Logic

- **Total Trips Today**: Counts records saved TODAY with your user ID
- **Net Weight Collected**: Sums net weight of TODAY's records
- **Pending Uploads**: Counts TODAY's records missing photos

Records from previous days are NOT included in dashboard stats.
