# Robot Trust Protocol — Specification v1.0

**Status:** Draft  
**Published:** 2026-03-18  
**Authors:** Robot Trust Hub  
**Website:** https://robot-trust.org  
**License:** CC0 1.0 Universal

---

## Abstract

The Robot Trust Protocol (RTP) defines a lightweight, decentralized standard for websites to publish machine-readable AI interaction policies. A website places a JSON file at a well-known URI; AI agents read this file before interacting with the site to understand access permissions, training policies, and preferred entry points.

---

## 1. Motivation

The web currently has `robots.txt` for controlling search engine crawlers. However, as AI agents become more capable — crawling, scraping, and training on web content — website owners need a richer, structured way to express their AI interaction policies.

RTP provides:
- **Machine-readable policies** that AI agents can parse in a single request
- **AI training permissions** controlling how content may be used in model training
- **Decentralized implementation** — any site can participate without central registration
- **Optional verification** — a public registry validates sites that opt in

---

## 2. Protocol Overview

### 2.1 Discovery

Any website implementing RTP must serve the certificate at:

```
https://{domain}/.well-known/robots-trust.json
```

The file must:
- Be served over HTTPS
- Return `Content-Type: application/json`
- Be valid JSON

### 2.2 Minimum Valid Certificate

Only one field is required:

```json
{
  "robot_trust_version": "1.0"
}
```

All other fields are optional but recommended.

---

## 3. Field Reference

### 3.1 Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `robot_trust_version` | `string` | ✅ Required | Always `"1.0"` for this version |
| `protocol` | `string` (URI) | Optional | Link to this specification |
| `schema` | `string` (URI) | Optional | Link to the JSON Schema for validation |

### 3.2 `ai_policy` Object

The `ai_policy` block provides a simplified summary for AI agent parsing. Agents should read this first.

```json
"ai_policy": {
  "agents": "allowed",
  "training": "restricted",
  "scraping": "limited"
}
```

| Field | Values | Default | Description |
|---|---|---|---|
| `agents` | `"allowed"` \| `"restricted"` \| `"denied"` | `"allowed"` | May AI agents interact with this site? |
| `training` | `"allowed"` \| `"restricted"` \| `"denied"` | `"allowed"` | May content be used for AI model training? |
| `scraping` | `"allowed"` \| `"limited"` \| `"denied"` | `"allowed"` | Is automated scraping permitted? |

### 3.3 `trust_status` Object

Describes the certificate status and optional issuer information.

```json
"trust_status": {
  "certificate_status": "verified",
  "certificate_issuer": "robot-trust.org",
  "trust_level": "pro",
  "issued": "2026-03-18",
  "expires": "2027-03-18"
}
```

| Field | Type | Description |
|---|---|---|
| `certificate_status` | `string` | `"verified"` \| `"pending"` \| `"self-declared"` \| `"revoked"` |
| `certificate_issuer` | `string` | Organization that issued the certificate |
| `trust_level` | `string` | `"basic"` \| `"pro"` \| `"enterprise"` |
| `issued` | `string` | ISO 8601 date (`YYYY-MM-DD`) |
| `expires` | `string` | ISO 8601 date (`YYYY-MM-DD`) |

### 3.4 `site_identity` Object

Optional metadata about the site.

| Field | Type | Description |
|---|---|---|
| `site_name` | `string` | Human-readable site name |
| `domain` | `string` | Canonical domain |
| `language` | `string` | BCP 47 language tag (e.g. `"en"`) |
| `owner_type` | `string` | `"company"` \| `"individual"` \| `"nonprofit"` |
| `purpose` | `string` | Short description of site purpose |

### 3.5 `access_points` Object

Describes preferred AI entry points.

| Field | Type | Description |
|---|---|---|
| `preferred_entry` | `string` | Preferred URL path for AI agents (e.g. `"/ai/"`) |
| `robot_safe_endpoints` | `array` | List of paths safe for AI crawling |
| `rate_limit_policy` | `string` | `"ai-friendly"` \| `"standard"` \| `"strict"` |

### 3.6 `ai_training` Object

Detailed training permission flags (boolean).

| Field | Type | Description |
|---|---|---|
| `training_allowed` | `boolean` | General training permission |
| `commercial_training_allowed` | `boolean` | Commercial model training |
| `scraping_allowed` | `boolean` | General scraping permission |
| `attribution_required` | `boolean` | Must the source be attributed? |

---

## 4. Agent Behavior

An AI agent implementing this protocol should:

1. **Fetch** `https://{domain}/.well-known/robots-trust.json`
2. **If not found** (404, timeout): proceed with default behavior
3. **If found**: read `ai_policy` first:
   - `agents: "denied"` → do not proceed
   - `agents: "restricted"` → proceed with caution, check additional fields
   - `agents: "allowed"` → proceed normally
4. **Apply training policy** from `ai_policy.training`
5. **Use preferred entry point** from `access_points.preferred_entry` if available

```javascript
// Reference decision logic
async function checkPolicy(domain) {
  const url = `https://${domain}/.well-known/robots-trust.json`;
  const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) return null; // No policy — use defaults

  const cert = await r.json();
  const ap = cert.ai_policy || {};

  if (ap.agents === "denied") throw new Error("Access denied by ai_policy");
  if (ap.training === "denied") markNoTraining(domain);

  return cert;
}
```

---

## 5. Versioning

The protocol version is declared in the `robot_trust_version` field. The current version is `1.0`.

Future versions will increment the version number. Agents must check this field and handle unknown versions gracefully (treat as version 1.0 if parseable).

---

## 6. Security Considerations

- The certificate file is **informational only** — it does not enforce policies technically
- AI agents are expected to respect declared policies voluntarily (similar to `robots.txt`)
- Certificates may be **verified** by third parties (e.g. robot-trust.org) for additional trust signals
- A `"verified"` status from an unknown issuer should be treated with skepticism

---

## 7. JSON Schema

A machine-readable JSON Schema for validating `robots-trust.json` files is available at:

```
https://robot-trust.org/schema/robots-trust-v1.json
```

Reference it in your file for IDE autocompletion:

```json
{
  "$schema": "https://robot-trust.org/schema/robots-trust-v1.json",
  "robot_trust_version": "1.0"
}
```

---

## 8. Example Implementations

See the `examples/` directory in this repository:

- `basic-site.json` — Minimal certificate, no verification
- `ai-friendly-site.json` — Full AI-optimized configuration
- `restricted-site.json` — Content-protected site

---

## License

This specification is released under **CC0 1.0 Universal**. You may use, copy, modify, and distribute it without restriction.
