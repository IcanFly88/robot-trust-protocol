/**
 * Robot Trust Protocol — Reference Agent (Node.js)
 * 
 * Fetches and applies a robots-trust.json policy for a given domain.
 * 
 * Usage:
 *   node trust-checker.js example.com
 * 
 * Or import as a module:
 *   import { checkTrust, applyPolicy } from './trust-checker.js';
 */

const WELL_KNOWN_PATH = '/.well-known/robots-trust.json';
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Fetch the robots-trust.json certificate for a domain.
 * Returns null if not found or on network error.
 * 
 * @param {string} domain  e.g. "example.com"
 * @returns {Promise<object|null>}
 */
export async function fetchCertificate(domain) {
  const url = `https://${domain}${WELL_KNOWN_PATH}`;
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) return null;

    const cert = await response.json();

    // Basic validation
    if (!cert.robot_trust_version) return null;

    return cert;
  } catch {
    return null; // Timeout, DNS failure, etc — proceed with no policy
  }
}

/**
 * Check a domain's Robot Trust policy and return a structured result.
 * 
 * @param {string} domain
 * @returns {Promise<{ allowed: boolean, training: string, scraping: string, cert: object|null }>}
 */
export async function checkTrust(domain) {
  const cert = await fetchCertificate(domain);

  if (!cert) {
    // No certificate — default behavior (allow)
    return { allowed: true, training: 'unknown', scraping: 'unknown', cert: null };
  }

  const policy = cert.ai_policy || {};

  return {
    allowed: policy.agents !== 'denied',
    restricted: policy.agents === 'restricted',
    training: policy.training || 'unknown',
    scraping: policy.scraping || 'unknown',
    cert
  };
}

/**
 * Apply a Robot Trust policy — throws if access is denied.
 * 
 * @param {string} domain
 * @throws {Error} If `ai_policy.agents` is "denied"
 */
export async function applyPolicy(domain) {
  const result = await checkTrust(domain);

  if (!result.allowed) {
    throw new Error(`[RTP] AI agent access denied by policy on ${domain}`);
  }

  if (result.restricted) {
    console.warn(`[RTP] Restricted access on ${domain} — review policy`);
  }

  if (result.training === 'denied') {
    console.info(`[RTP] Training not permitted on ${domain} — content excluded from training data`);
  }

  if (result.scraping === 'denied') {
    throw new Error(`[RTP] Scraping denied by policy on ${domain}`);
  }

  if (result.scraping === 'limited') {
    console.info(`[RTP] Limited scraping on ${domain} — apply rate limiting`);
  }

  const entry = result.cert?.access_points?.preferred_entry;
  if (entry) {
    console.info(`[RTP] Preferred entry point for ${domain}: ${entry}`);
  }

  return result;
}

// CLI usage: node trust-checker.js example.com
if (process.argv[2]) {
  const domain = process.argv[2].replace(/^https?:\/\//, '');
  checkTrust(domain).then(result => {
    console.log(`\nRobot Trust Check: ${domain}`);
    console.log('─'.repeat(40));
    if (!result.cert) {
      console.log('❌ No robots-trust.json found');
    } else {
      console.log(`✅ Certificate found (v${result.cert.robot_trust_version})`);
      console.log(`   Status:   ${result.cert.trust_status?.certificate_status ?? 'unknown'}`);
      console.log(`   Agents:   ${result.cert.ai_policy?.agents ?? 'not specified'}`);
      console.log(`   Training: ${result.cert.ai_policy?.training ?? 'not specified'}`);
      console.log(`   Scraping: ${result.cert.ai_policy?.scraping ?? 'not specified'}`);
    }
    console.log('');
  });
}
