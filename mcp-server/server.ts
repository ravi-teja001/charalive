import express from 'express';
import { supabase } from './supabaseClient.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;

app.use(express.json());

app.get('/mcp/ping', (req, res) => {
  res.json({ message: 'MCP server is running!' });
});

// Execute SQL file
app.post('/mcp/execute-sql', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const sqlPath = path.join('../database', filename);
    if (!fs.existsSync(sqlPath)) {
      return res.status(404).json({ error: 'SQL file not found' });
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // For Supabase, we need to use the SQL editor or direct SQL execution
    // The anon key doesn't have permission to execute arbitrary SQL
    // We'll return the SQL content for manual execution
    res.json({ 
      message: 'SQL file loaded. Please execute manually in Supabase SQL Editor.',
      sqlContent: sql,
      filename: filename,
      instructions: `
To execute this SQL:
1. Go to https://supabase.com/dashboard/project/pwifzztuubxkyrqljtyr/sql
2. Copy and paste the SQL content above
3. Click "Run" to execute
      `
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check current user context
app.get('/mcp/check-user', async (req, res) => {
  try {
    // Try to get the current authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();
    
    res.json({
      message: 'Current user check',
      authenticatedUser: user,
      userId: user?.id,
      userEmail: user?.email,
      error: error?.message,
      appLikelyUses: user?.email || user?.id || 'unknown'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check app environment
app.get('/mcp/check-env', async (req, res) => {
  try {
    // Test the exact same environment logic as the app
    const isPlaceholder = 'https://placeholder.supabase.co'.includes('placeholder');
    const actualUrl = 'https://pwifzztuubxkyrqljtyr.supabase.co';
    const isProductionMode = !actualUrl.includes('placeholder');
    
    res.json({
      message: 'Environment check',
      isPlaceholder: isPlaceholder,
      actualUrl: actualUrl,
      isProductionMode: isProductionMode,
      appShouldUse: isProductionMode ? 'DATABASE' : 'LOCALSTORAGE'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test procurement records
app.get('/mcp/debug-procurement', async (req, res) => {
  try {
    console.log('🔍 Debug: Testing procurement records query...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('raw_biomass_procurement')
      .select('count')
      .limit(1);
    
    if (testError) {
      return res.json({ 
        error: 'Database connection failed', 
        details: testError 
      });
    }
    
    // Get all records (debug only)
    const { data: allRecords, error: allError } = await supabase
      .from('raw_biomass_procurement')
      .select('*')
      .limit(5);
    
    if (allError) {
      return res.json({ 
        error: 'Failed to fetch records', 
        details: allError 
      });
    }
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('raw_biomass_procurement')
      .select('*')
      .limit(0);
    
    res.json({
      message: 'Debug successful',
      totalRecords: testData?.length || 0,
      sampleRecords: allRecords || [],
      tableExists: !tableError,
      tableError: tableError?.message || null
    });
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Example endpoint: fetch all rows from a Supabase table
app.get('/mcp/data', async (req, res) => {
  // TODO: Replace 'your_table' with your actual table name
  const { data, error } = await supabase.from('your_table').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(port, () => {
  console.log(`MCP server listening at http://localhost:${port}`);
});
