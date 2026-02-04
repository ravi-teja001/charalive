#!/usr/bin/env node
/**
 * Generate an Argon2 password hash for manual user insertion.
 * Usage: node hash-password.js [password]
 *        npm run hash-password -- YourPassword123
 */
import argon2 from 'argon2';
const password = process.argv[2] || process.argv[process.argv.length - 1];
if (!password || password.startsWith('-')) {
  console.error('Usage: node hash-password.js <password>');
  console.error('       npm run hash-password -- YourPassword123');
  process.exit(1);
}
const hash = await argon2.hash(password, { type: argon2.argon2id });
console.log(hash);
