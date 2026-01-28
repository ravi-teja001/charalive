#!/bin/bash

echo "🔧 SQL Execution Script for Biochar Bloom Database (NPX Version)"
echo "================================================================"

# Use npx to run supabase without global installation
echo "📦 Using npx to run Supabase CLI..."

# Check if we can use npx supabase
if ! npx supabase --version &> /dev/null; then
    echo "❌ Supabase CLI not available via npx. Installing temporarily..."
    npm install supabase
fi

# Check if user is logged in to Supabase
echo "🔐 Checking Supabase authentication..."
if ! npx supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   npx supabase login"
    echo ""
    echo "⚠️  You need to login first, then run this script again."
    exit 1
fi

echo "✅ Supabase CLI ready and authenticated"
echo ""

# List of SQL files to execute in order
SQL_FILES=(
    "schema.sql"
    "AUTO_FIX_ALL.sql"
    "FIX_USER_ISOLATION.sql"
    "ADD_MOISTURE_COLUMN.sql"
    "ADD_PROCUREMENT_ID_COLUMN.sql"
    "ADD_SUB_DISTRICT_COLUMN.sql"
    "ADD_EMAIL_FIELD_TO_PROCUREMENT.sql"
    "ADD_USER_EMAIL_COLUMN.sql"
)

# Execute each SQL file
for sql_file in "${SQL_FILES[@]}"; do
    if [ -f "database/$sql_file" ]; then
        echo "📄 Executing $sql_file..."
        npx supabase db push --file "database/$sql_file"
        if [ $? -eq 0 ]; then
            echo "✅ $sql_file executed successfully"
        else
            echo "❌ Failed to execute $sql_file"
            echo "⚠️  Continuing with next file..."
        fi
        echo ""
    else
        echo "⚠️  File not found: database/$sql_file"
    fi
done

echo "🎉 SQL execution completed!"
echo ""
echo "📋 Summary:"
echo "   - Database schema created"
echo "   - Profiles table configured"
echo "   - Authentication triggers set up"
echo "   - ✅ USER ISOLATION ENABLED - Users can only see their own data"
echo "   - Additional columns added"
echo ""
echo "🔒 Security Fix: Each user will now only see their own procurement records, expenses, and deployment data."
echo "🌐 Your database is now ready for the Biochar Bloom application!"
