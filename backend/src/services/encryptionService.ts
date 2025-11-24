// backend/src/services/encryptionService.ts

import * as crypto from 'crypto';

// --- Configuration ---
const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.AES_SECRET_KEY;
const IV_LENGTH = 16; 

// --- Safety Check ---
if (!KEY || KEY.length !== 32) {
    console.error("FATAL ERROR: AES_SECRET_KEY must be exactly 32 characters long. Please set it in your .env file.");
}

/**
 * Encrypts plaintext data using AES-256-CBC.
 * * @param text The data (e.g., the JSON string of the question and answers).
 * @returns A string containing the IV and the encrypted content (ciphertext), separated by a colon.
 */
export function encrypt(text: string): string {
    if (!KEY) throw new Error("Encryption key is not set.");
    
    // Generate a secure, unique Initialization Vector (IV) for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'utf8'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return the IV (unencrypted) and the ciphertext, separated by a colon.
    // The IV is necessary for decryption.
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts data that was encrypted using the 'encrypt' function.
 * * @param encryptedText The combined IV and ciphertext string (e.g., 'iv:ciphertext').
 * @returns The original plaintext data.
 */
export function decrypt(encryptedText: string): string {
    if (!KEY) throw new Error("Encryption key is not set.");
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted format. Expected 'iv:ciphertext'.");
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    if (iv.length !== IV_LENGTH) {
        throw new Error("Invalid IV length during decryption.");
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'utf8'), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
