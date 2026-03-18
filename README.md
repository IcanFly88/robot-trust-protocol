# Robot Trust Protocol (RTP)

> A machine-readable AI interaction standard for websites — like `robots.txt`, but for the AI era.

[![Version](https://img.shields.io/badge/RTP-v1.0-6366f1)](https://github.com/IcanFly88/robot-trust-protocol/releases/tag/v1.0)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Website](https://img.shields.io/badge/Website-robot--trust.org-blue)](https://robot-trust.org)

---

## What is RTP?

The Robot Trust Protocol lets any website publish a machine-readable file declaring how AI agents may interact with it — whether they can crawl, scrape, or train on its content.

---

## Quick Example

Create this file at `/.well-known/robots-trust.json`:

```json
{
  "robot_trust_version": "1.0",
  "ai_policy": {
    "agents": "allowed",
    "training": "restricted",
    "scraping": "limited"
  }
}
```

An AI agent reads it in one fetch. No registration required.

---

## Why RTP?

`robots.txt` was designed for search engine crawlers in 1994. It controls *whether* a bot can visit a page — but it says nothing about:

- ❌ AI training permissions
- ❌ Scraping policies
- ❌ Preferred machine-readable entry points
- ❌ Trust signals for AI agents

**RTP fills this gap.** It gives websites a structured, machine-readable way to express AI interaction policies — and gives AI agents a reliable signal before interacting with any site.

---

## How It Works

**1 — Place the file**
```
https://yourdomain.com/.well-known/robots-trust.json
```

**2 — AI agents fetch it**
```js
const r = await fetch(`https://${domain}/.well-known/robots-trust.json`);
const policy = await r.json();
if (policy.ai_policy.agents === 'denied') return; // respect the policy
```

**3 — Optional: get verified**

Register at [robot-trust.org](https://robot-trust.org) to get a signed, verified certificate listed in the public registry.

---

## Repository Structure

```
robot-trust-protocol/
├── README.md
├── specification.md             ← Full protocol specification
├── LICENSE                      ← MIT
├── schema/
│   └── robots-trust-v1.json    ← JSON Schema for validation
├── examples/
│   ├── basic-site.json         ← Minimal (allow all)
│   ├── ai-friendly-site.json   ← Full verified certificate
│   └── restricted-site.json    ← Content-protected site
└── reference-agent/
    ├── trust-checker.js        ← Node.js implementation
    └── trust-checker.py        ← Python implementation
```

---

## The `ai_policy` Block

| Field | Values | Meaning |
|---|---|---|
| `agents` | `"allowed"` · `"restricted"` · `"denied"` | May AI agents interact with this site? |
| `training` | `"allowed"` · `"restricted"` · `"denied"` | May content be used for AI model training? |
| `scraping` | `"allowed"` · `"limited"` · `"denied"` | Is automated scraping permitted? |

---

## Specification

[→ Read the full specification](specification.md)

---

## Validator

Check any domain: **[robot-trust.org/validator](https://robot-trust.org/validator)**

```bash
curl "https://robot-trust.org/api/verify?domain=yourdomain.com"
```

---

## Links

- 🌐 **Website:** [robot-trust.org](https://robot-trust.org)
- 📄 **Protocol Docs:** [robot-trust.org/protocol](https://robot-trust.org/protocol)
- 📋 **Full Specification:** [specification.md](specification.md)
- 🔷 **JSON Schema:** [schema/robots-trust-v1.json](schema/robots-trust-v1.json)

---

## Contributing

Issues and discussions are open. If you're implementing RTP in a crawler, agent framework, or website tool — we'd love to hear about it.

---

## License

[MIT](LICENSE) — free to use, implement, and build on, with no restrictions.
