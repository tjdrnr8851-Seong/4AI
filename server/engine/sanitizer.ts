/**
 * Sanitizer and Validation Utilities
 * Unicode code point counter and SSRF-safe URL validation
 */

/**
 * Counts unicode code points accurately (e.g. emojis and complex scripts)
 */
export function countUnicodePoints(str: string): number {
  if (!str) return 0;
  return Array.from(str).length;
}

/**
 * Check if a URL targets private, loopback, or cloud metadata addresses (SSRF prevention)
 */
export function isSafePublicUrl(urlString: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTP and HTTPS protocols are permitted' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check localhost & loopback
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      return { safe: false, reason: 'Loopback and localhost addresses are forbidden' };
    }

    // Check Cloud metadata services
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { safe: false, reason: 'Cloud metadata access is strictly forbidden' };
    }

    // IPv4 private ranges check
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);

      // 10.0.0.0/8
      if (octet1 === 10) return { safe: false, reason: 'Private IP space (10.0.0.0/8) is forbidden' };
      // 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return { safe: false, reason: 'Private IP space (172.16.0.0/12) is forbidden' };
      // 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return { safe: false, reason: 'Private IP space (192.168.0.0/16) is forbidden' };
      // 127.0.0.0/8
      if (octet1 === 127) return { safe: false, reason: 'Loopback range is forbidden' };
      // 169.254.0.0/16 (link local)
      if (octet1 === 169 && octet2 === 254) return { safe: false, reason: 'Link-local space is forbidden' };
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }
}
