# Robot Trust Protocol (RTP)

> An open standard for AI-friendly websites — publish your AI interaction policy in a machine-readable file that any AI agent can discover and read.

[![Protocol Version](https://img.shields.io/badge/RTP-v1.0-6366f1)](https://robot-trust.org/protocol)
[![License: CC0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://creativecommons.org/publicdomain/zero/1.0/)

---

## What is it?

The Robot Trust Protocol defines a simple standard for websites to publish machine-readable AI interaction policies. Place a `robots-trust.json` file at a well-known URI — AI agents check it before crawling, scraping, or training on your content.

```
https://yourdomain.com/.well-known/robots-trust.json
```

This is to AI agents what `robots.txt` is to search engine crawlers — but richer, structured, and designed for the AI era.

---

## Quick Start

**1. Create your file:**

```json
{
  "robot_trust_version": "1.0",
  "protocol": "https://robot-trust.org/protocol",
  "ai_policy": {
    "agents": "allowed",
    "training": "restricted",
    "scraping": "limited"
  }
}
```

**2. Place it at:**

```
/.well-known/robots-trust.json
```

**3. Verify it works:**

```bash
curl https://yourdomain.com/.well-known/robots-trust.json
```

Or use the online validator: **[robot-trust.org/validator](https://robot-trust.org/validator)**

---

## Repository Structure

```
robot-trust-protocol/
├── README.md                    ← You are here
├── specification.md             ← Full protocol specification
├── CHANGELOG.md                 ← Version history
├── schema/
│   └── robots-trust-v1.json    ← JSON Schema (validate your files against this)
├── examples/
│   ├── basic-site.json          ← Minimal valid certificate
│   ├── ai-friendly-site.json   ← AI-optimized site example
│   └── restricted-site.json    ← Content-protected site example
└── reference-agent/
    ├── trust-checker.js         ← Node.js reference implementation
    └── trust-checker.py        ← Python reference implementation
```

---

## The `ai_policy` Block

The core of the protocol — a simple, machine-readable policy summary:

| Field | Values | Meaning |
|---|---|---|
| `agents` | `"allowed"` \| `"restricted"` \| `"denied"` | May AI agents interact with this site? |
| `training` | `"allowed"` \| `"restricted"` \| `"denied"` | May content be used for AI model training? |
| `scraping` | `"allowed"` \| `"limited"` \| `"denied"` | Is automated scraping permitted? |

---

## Validator

Check any domain: **[robot-trust.org/validator](https://robot-trust.org/validator)**

```bash
# Or via API
curl "https://robot-trust.org/api/verify?domain=yourdomain.com"
```

---

## Links

- 🌐 **Website:** [robot-trust.org](https://robot-trust.org)
- 📄 **Protocol Docs:** [robot-trust.org/protocol](https://robot-trust.org/protocol)
- 📋 **Full Specification:** [robot-trust.org/specification](https://robot-trust.org/specification)
- 🔷 **JSON Schema:** [robot-trust.org/schema/robots-trust-v1.json](https://robot-trust.org/schema/robots-trust-v1.json)

---

## License

The Robot Trust Protocol spec and all files in this repository are released under **[CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)** — you can use, copy, modify, and distribute them freely, with no conditions.
