#!/usr/bin/env node

// Script to generate a secure JWT secret
const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret for Bappa AI Backend...\n');

// Generate a 64-byte (512-bit) random hex string
const secret = crypto.randomBytes(64).toString('hex');

console.log('✅ Generated secure JWT secret:');
console.log(`JWT_SECRET=${secret}\n`);

console.log('📝 Add this to your .env file:');
console.log(`JWT_SECRET=${secret}\n`);

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Keep this secret secure and never commit it to version control');
console.log('2. Use different secrets for development, staging, and production');
console.log('3. Rotate this secret periodically in production');
console.log('4. Store this securely in your deployment environment\n');

console.log('🚀 Your backend is now ready for secure JWT authentication!');
