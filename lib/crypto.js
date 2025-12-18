import crypto from 'crypto';

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':');
  const hashBuffer = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hashBuffer === key;
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}
