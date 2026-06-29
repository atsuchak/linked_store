import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length === 64) {
    return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  }
  // Fallback to a consistent dummy key if not found (only for testing)
  console.warn("ENCRYPTION_KEY not found or invalid length. Using insecure fallback key.");
  return Buffer.alloc(32, "a");
}

export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag().toString("hex");
    
    // Format: iv:authTag:encryptedText
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return text;
  }
}

export function decrypt(text: string): string {
  if (!text) return text;
  
  // Return the original text if it's not in the expected encrypted format (for backward compatibility)
  if (!text.includes(":")) return text;
  
  try {
    const parts = text.split(":");
    if (parts.length !== 3) return text; // Not the right format
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    
    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return original if decryption fails (fallback for old unencrypted data that might have colons)
    return text; 
  }
}
