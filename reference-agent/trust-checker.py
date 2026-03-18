"""
Robot Trust Protocol — Reference Agent (Python)

Fetches and applies a robots-trust.json policy for a given domain.

Usage:
    python trust-checker.py example.com

Or import as a module:
    from trust_checker import check_trust, fetch_certificate
"""

import sys
import json
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

WELL_KNOWN_PATH = "/.well-known/robots-trust.json"
DEFAULT_TIMEOUT = 5  # seconds


def fetch_certificate(domain: str) -> dict | None:
    """
    Fetch the robots-trust.json certificate for a domain.
    Returns None if not found or on network error.
    """
    url = f"https://{domain}{WELL_KNOWN_PATH}"
    try:
        req = Request(url, headers={"Accept": "application/json"})
        with urlopen(req, timeout=DEFAULT_TIMEOUT) as response:
            if response.status != 200:
                return None
            data = json.loads(response.read().decode("utf-8"))
            # Basic validation
            if "robot_trust_version" not in data:
                return None
            return data
    except (URLError, HTTPError, json.JSONDecodeError, TimeoutError):
        return None  # Proceed with no policy


def check_trust(domain: str) -> dict:
    """
    Check a domain's Robot Trust policy.
    Returns a structured result dict.
    """
    cert = fetch_certificate(domain)

    if cert is None:
        return {
            "allowed": True,
            "restricted": False,
            "training": "unknown",
            "scraping": "unknown",
            "cert": None,
        }

    policy = cert.get("ai_policy", {})

    return {
        "allowed": policy.get("agents") != "denied",
        "restricted": policy.get("agents") == "restricted",
        "training": policy.get("training", "unknown"),
        "scraping": policy.get("scraping", "unknown"),
        "cert": cert,
    }


def apply_policy(domain: str) -> dict:
    """
    Apply a Robot Trust policy — raises if access is denied.
    """
    result = check_trust(domain)

    if not result["allowed"]:
        raise PermissionError(f"[RTP] AI agent access denied by policy on {domain}")

    if result["restricted"]:
        print(f"[RTP] WARNING: Restricted access on {domain} — review policy")

    if result["training"] == "denied":
        print(f"[RTP] INFO: Training not permitted on {domain}")

    if result["scraping"] == "denied":
        raise PermissionError(f"[RTP] Scraping denied by policy on {domain}")

    if result["scraping"] == "limited":
        print(f"[RTP] INFO: Limited scraping on {domain} — apply rate limiting")

    cert = result.get("cert") or {}
    entry = (cert.get("access_points") or {}).get("preferred_entry")
    if entry:
        print(f"[RTP] INFO: Preferred entry point for {domain}: {entry}")

    return result


# CLI usage: python trust-checker.py example.com
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python trust-checker.py <domain>")
        sys.exit(1)

    domain = sys.argv[1].replace("https://", "").replace("http://", "")
    result = check_trust(domain)

    print(f"\nRobot Trust Check: {domain}")
    print("─" * 40)
    if result["cert"] is None:
        print("❌ No robots-trust.json found")
    else:
        cert = result["cert"]
        status = (cert.get("trust_status") or {}).get("certificate_status", "unknown")
        policy = cert.get("ai_policy") or {}
        print(f"✅ Certificate found (v{cert.get('robot_trust_version', '?')})")
        print(f"   Status:   {status}")
        print(f"   Agents:   {policy.get('agents', 'not specified')}")
        print(f"   Training: {policy.get('training', 'not specified')}")
        print(f"   Scraping: {policy.get('scraping', 'not specified')}")
    print()
