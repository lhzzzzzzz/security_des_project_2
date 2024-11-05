import { createHash } from 'crypto';

/**
 * Merges two keys and generates a new hashed key
 * @param key1 The first key
 * @param key2 The second key
 * @returns A new key consisting of letters and numbers
 */
export function hashMergeKeys(key1: string, key2: string): string {
    // Combine the two keys
    const combinedKey = key1 + key2;

    // Create a SHA-256 hash
    const hash = createHash('sha256');
    hash.update(combinedKey);

    // Get the hash value and convert it to a hexadecimal string
    const hashedKey = hash.digest('hex');

    // Take the first 32 characters as the final key
    return hashedKey.slice(0, 32);
}
