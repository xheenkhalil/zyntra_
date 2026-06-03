"use strict";
// backend/src/services/encryptionService.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto = __importStar(require("crypto"));
// --- Configuration ---
const ALGORITHM = 'aes-256-cbc';
const KEY = process.env.AES_SECRET_KEY;
const IV_LENGTH = 16;
// --- Safety Check ---
if (!KEY || KEY.length !== 32) {
    console.error('FATAL ERROR: AES_SECRET_KEY must be exactly 32 characters long. Please set it in your .env file.');
}
/**
 * Encrypts plaintext data using AES-256-CBC.
 * * @param text The data (e.g., the JSON string of the question and answers).
 * @returns A string containing the IV and the encrypted content (ciphertext), separated by a colon.
 */
function encrypt(text) {
    if (!KEY)
        throw new Error('Encryption key is not set.');
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
function decrypt(encryptedText) {
    if (!KEY)
        throw new Error('Encryption key is not set.');
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted format. Expected 'iv:ciphertext'.");
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    if (iv.length !== IV_LENGTH) {
        throw new Error('Invalid IV length during decryption.');
    }
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'utf8'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
