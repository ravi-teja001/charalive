# Debugging Blank Page Issue

## Steps to Debug

1. **Check Browser Console**
   - Open Developer Tools (F12 or Cmd+Option+I)
   - Look for JavaScript errors in the Console tab
   - Share any error messages you see

2. **Check Network Tab**
   - Look for failed requests
   - Check if the app files are loading

3. **Verify Environment Variables**
   - Make sure `.env.local` file exists in the project root
   - Verify it contains:
     ```
     VITE_SUPABASE_URL=your_url
     VITE_SUPABASE_KEY=your_key
     ```

4. **Restart Dev Server**
   - Stop the current dev server (Ctrl+C)
   - Run: `npm run dev`
   - Check if there are any error messages

5. **Check Database Setup**
   - The database tables might not exist yet
   - Run the SQL schema from `database/schema.sql` in your Supabase dashboard
   - This is required for the app to work properly

## Common Issues

- **Blank page with no errors**: Usually means a React rendering error
- **CORS errors**: Check Supabase URL and key
- **404 errors**: Check if routes are correct
- **Database errors**: Run the SQL schema first
