import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

/**
 * Hash a password. Uses Argon2 (more secure than bcrypt).
 * New users get Argon2 hashes (format: $argon2id$v=19$...)
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

/**
 * Verify a password against stored hash.
 * Supports both Argon2 (new) and bcrypt (legacy) hashes.
 * Bcrypt hashes start with $2a$ or $2b$; Argon2 starts with $argon2.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const trimmed = storedHash.trim();
  if (trimmed.startsWith('$2a$') || trimmed.startsWith('$2b$') || trimmed.startsWith('$2y$')) {
    return bcrypt.compare(password, storedHash);
  }
  return argon2.verify(storedHash, password);
}
