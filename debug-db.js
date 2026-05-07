const { Client } = require('pg');

// Test your SUPABASE_DB_URL format
const testConnectionString = (connectionString) => {
  console.log('Testing connection string:', connectionString.replace(/:[^:]+@/, ':***@'));

  try {
    const client = new Client({
      connectionString,
      ssl: false // Test without SSL first
    });

    console.log('✓ Connection string format is valid');
    console.log('  Host:', client.host);
    console.log('  Port:', client.port);
    console.log('  Database:', client.database);
    console.log('  User:', client.user);
    console.log('  SSL enabled:', client.ssl !== false);

    return true;
  } catch (error) {
    console.log('✗ Connection string format error:', error.message);
    return false;
  }
};

// Test cases
const testCases = [
  // Replace with your actual connection string
  process.env.SUPABASE_DB_URL || 'postgresql://postgres.test:test@localhost:5432/postgres',
  // Common mistake: localhost instead of Supabase
  'postgresql://postgres:password@localhost:5432/postgres',
  // Correct format example
  'postgresql://postgres.abc123:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres'
];

console.log('=== SUPABASE_DB_URL Format Validator ===\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}:`);
  testConnectionString(testCase);
  console.log('');
});

console.log('=== Common Issues to Check ===');
console.log('1. Use POOLED connection (port 6543), not DIRECT (port 5432)');
console.log('2. Password should be URL-encoded if it contains special characters');
console.log('3. Host should be aws-0-REGION.pooler.supabase.com');
console.log('4. Format: postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres');