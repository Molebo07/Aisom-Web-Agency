import CryptoJS from 'crypto-js';

// Generate a secure hash of the password using SHA-256
// This adds an extra layer of encryption on top of HTTPS
export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

// Verify a password against its hash
export function verifyPasswordHash(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate a unique client identifier for tracking login attempts
export function generateClientId(): string {
  if (typeof window === 'undefined') return '';
  
  let clientId = sessionStorage.getItem('aisom:client:id');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('aisom:client:id', clientId);
  }
  return clientId;
}
