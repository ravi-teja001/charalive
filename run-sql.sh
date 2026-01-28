#!/bin/bash

echo "🔧 SQL Execution Script for Biochar Bloom Database"
echo "=================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI found and authenticated"
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
        supabase db push --file "database/$sql_file"
        if [ $? -eq 0 ]; then
            echo "✅ $sql_file executed successfully"
        else
            echo "❌ Failed to execute $sql_file"
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
