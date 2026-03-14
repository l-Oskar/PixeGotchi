/**
 * Validates genome hash format according to SPEC.md Section 12.4
 * 
 * Format: {timestamp}-{randomString}-{md5hash}
 * Example: 1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038
 * 
 * @param genomeHash - The genome hash string to validate
 * @returns true if valid, false otherwise
 */
export function validateGenomeHash(genomeHash: string): boolean {
  if (!genomeHash || typeof genomeHash !== 'string') {
    return false;
  }

  // Pattern: timestamp (13 digits) - random string (alphanumeric) - hex string (32 chars)
  const genomeHashPattern = /^\d{13}-[a-z0-9]+-[a-f0-9]{32}$/;
  
  return genomeHashPattern.test(genomeHash);
}

/**
 * Validates genome hash and throws error if invalid
 * 
 * @param genomeHash - The genome hash string to validate
 * @throws Error if invalid
 */
export function assertValidGenomeHash(genomeHash: string): void {
  if (!validateGenomeHash(genomeHash)) {
    throw new Error(
      `Invalid genome hash format: "${genomeHash}". ` +
      `Expected format: {timestamp (13 digits)}-{randomString}-{md5hash (32 hex chars)}. ` +
      `Example: 1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038`
    );
  }
}
