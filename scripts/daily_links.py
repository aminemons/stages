#!/usr/bin/env python3
"""Daily technical URL audit for the published internship inventory.
HTTP checks are NOT confirmation that an internship is open.
No email is sent, no login attempted, no job application submitted.
"""
from __future__ import annotations
import csv
import io
import json
import re
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
OUT = ROOT / "data"
OUT.mkdir(exist_ok=True)
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")
AGENT = "MaterialsInternshipsAudit/1.0 (public offer URL health, once per day)"
PATTERN_J = re.compile(r'(<script id="jobdata" type="application/json">)(.*?)(</script>)', re.S)
PATTERN_C = re.compile(r'(<script id="companydata" type="application/json">)(.*?)(</script>)', re.S)
TIMEOUT = 9

def inspect(url):
    try:
        parts = urlsplit(str(url))
        if parts.scheme not in ("https", "http") or not parts.hostname:
            return "INVALID", "URL non HTTP"
        host = parts.hostname.lower()
        if host in ("localhost", "127.0.0.1", "::1") or host.endswith(".local"):
            return "INVALID", "Adresse non publique"
        headers = {"User-Agent": AGENT, "Accept": "text/html,*/*;q=0.5"}
        for method in ("HEAD", "GET"):
            try:
                if method == "GET":
                    headers["Range"] = "bytes=0-2047"
                req = urllib.request.Request(url, headers=headers, method=method)
                with urllib.request.urlopen(req, timeout=TIMEOUT) as result:
                    code = result.status
                    if 200 <= code < 400:
                        return str(code), "Page techniquement accessible; offre et candidature NON confirmées"
                    return str(code), "Réponse HTTP; candidature non confirmée"
            except urllib.error.HTTPError as error:
                code = error.code
                if code in (405, 501) and method == "HEAD":
                    continue
                if code in (401, 403, 429):
                    return str(code), "Accès restreint/anti-bot; état réel INCONNU"
                if code in (404, 410):
                    return str(code), "Lien introuvable; vérifier sur le portail officiel"
                return str(code), "HTTP erreur; révision nécessaire"
        return "UNKNOWN", "Vérification incomplète"
    except (TimeoutError, OSError, ValueError, urllib.error.URLError) as exc:
        return "UNKNOWN", "Échec réseau ou délai; état réel INCONNU"

def write_csv(path, records, fields):
    with path.open("w", encoding="utf-8", newline="") as dest:
        writer = csv.DictWriter(dest, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for item in records:
            row = dict(item)
            for key in ("methods", "softwareTags", "tags"):
                if isinstance(row.get(key), list):
                    row[key] = " | ".join(row[key])
            writer.writerow(row)

def main():
    html = INDEX.read_text(encoding="utf-8")
    mj = PATTERN_J.search(html)
    mc = PATTERN_C.search(html)
    if mj is None or mc is None:
        raise RuntimeError("Missing embedded JSON blocks; refusing to overwrite.")
    jobs = json.loads(mj.group(2))
    companies = json.loads(mc.group(2))
    if len(jobs) < 400:
        raise RuntimeError("Unexpected listing-count drop; refusing to overwrite.")
    cache = {}
    unique = sorted({str(job.get("url", "")) for job in jobs if job.get("url")})
    print("Auditing %d unique HTTP links in a corpus of %d records." % (len(unique), len(jobs)))
    with ThreadPoolExecutor(max_workers=4) as pool:
        for url, result in zip(unique, pool.map(inspect, unique)):
            cache[url] = result
    stats = {}
    for job in jobs:
        status, detail = cache.get(job.get("url"), ("INVALID", "Lien manquant"))
        job["http_status"] = status
        job["http_checked_at"] = STAMP
        job["link_status"] = detail
        for key in ("methods", "softwareTags", "tags"):
            if not isinstance(job.get(key), list):
                job[key] = []
        stats[status] = stats.get(status, 0) + 1
    jobs_payload = json.dumps(jobs, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    html = html[:mj.start(2)] + jobs_payload + html[mj.end(2):]
    # Maintain a truthful separation between human review and automatic HTTP checks.
    summary = (
        "Contrôle technique automatique des liens : " + STAMP
        + " · " + str(len(jobs)) + " annonces historiques · "
        + str(stats.get("200", 0) + stats.get("206", 0)) + " réponses HTTP 200/206"
        + " · cela ne prouve PAS que les candidatures sont ouvertes."
    )
    html = re.sub(
        r'(<div id="daily-update"[^>]*>).*?(</div>)',
        lambda m: m.group(1) + escape(summary) + m.group(2),
        html, count=1, flags=re.S
    )
    INDEX.write_text(html, encoding="utf-8")
    emails = {x["name"].casefold(): x for x in companies if x.get("email") and x.get("source")}
    for job in jobs:
        contact = emails.get(str(job.get("company", "")).casefold(), {})
        job["contact_email"] = contact.get("email", "")
        job["contact_source"] = contact.get("source", "")
    job_fields = [
        "id","company","title","city","sector","level","cat","tech",
        "methods","softwareTags","paymin","paymax","date","start",
        "duration","url","verification","lastChecked","http_status",
        "http_checked_at","link_status","contact_email","contact_source"
    ]
    contact_fields = [
        "name","sector","city","office","suggestedRole","person",
        "email","phone","contactUrl","recruitRoute","source","notes"
    ]
    write_csv(OUT / "internships.csv", jobs, job_fields)
    write_csv(OUT / "contacts.csv", companies, contact_fields)
    print("Saved site + CSV feeds; HTTP statuses:", stats)
    print("Note: no human review, application test, or new-offer discovery performed.")

if __name__ == "__main__":
    main()
