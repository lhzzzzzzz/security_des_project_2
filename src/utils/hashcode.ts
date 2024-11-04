import { createHash } from 'crypto';

/**
 * 合并两个密钥并生成一个新的哈希密钥
 * @param key1 第一个密钥
 * @param key2 第二个密钥
 * @returns 返回一个由字母和数字组成的新密钥
 */
export function hashMergeKeys(key1: string, key2: string): string {
    // 合并两个密钥
    const combinedKey = key1 + key2;

    // 创建一个 SHA-256 哈希
    const hash = createHash('sha256');
    hash.update(combinedKey);

    // 获取哈希值并转为十六进制字符串
    const hashedKey = hash.digest('hex');

    // 取前32个字符作为最终密钥
    return hashedKey.slice(0, 32);
}
