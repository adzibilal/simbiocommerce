import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-this!!';
const ALGORITHM = 'aes-256-cbc';

function getKey(): Buffer {
  const key = ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32);
  return Buffer.from(key, 'utf-8');
}

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

export function isEncrypted(text: string): boolean {
  const parts = text.split(':');
  return parts.length === 2 && parts[0].length === 32 && /^[0-9a-f]+$/i.test(parts[0]);
}
