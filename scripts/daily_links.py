#!/usr/bin/env python3
"""Daily link + employer page CONTENT audit. A page is not an accepted application.
No account access, no emails, no AI-generated contacts, no applications.
"""
from __future__ import annotations
import csv
import html as htmlmod
import json
import re
import socket
import unicodedata
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)
STAMP = datetime.now(timezone.utc).strftime("%Y-%m-%d")
JOBS_RE = re.compile(r'(<script id="jobdata" type="application/json">)(.*?)(</script>)', re.S)
COMPANIES_RE = re.compile(r'(<script id="companydata" type="application/json">)(.*?)(</script>)', re.S)

# Negative indicators MUST be searched BEFORE positive text ("Apply" often appears
# on generic error-page navigation). Escape/normalize punctuation and HTML entities.
DEAD_TERMS = (
    "cette offre n'est plus disponible",
    "cette offre n’est plus disponible",
    "offre n'est plus disponible",
    "cette annonce n'est plus disponible",
    "ce poste n'est plus disponible",
    "offre expiree",
    "l'offre n'est plus disponible",
    "offre a ete pourvue",
    "this job is no longer available",
    "the job you are looking for is no longer available",
    "this position has been filled",
    "this job has expired",
    "job posting has expired",
    "this requisition is no longer available",
    "this vacancy is closed",
    "job not found",
    "this posting is no longer accepting applications",
    "we are no longer accepting applications for this position",
    "poste pourvu",
)
POSITIVE_TERMS = ("je postule", "postuler à cette offre", "candidater sur", "apply now", "apply for this job", "postuler en un clic")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; InternshipOpportunityAudit/2.0; public links)",
    "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.7",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}
READ_LIMIT = 300_000
TIMEOUT = 10

class VisibleHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "svg"):
            self.skip += 1
    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg") and self.skip:
            self.skip -= 1
    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data)

def normalized(s):
    s = htmlmod.unescape(s)
    s = re.sub(r"\s+", " ", s.replace("\u2019", "'").replace("\u00a0", " "))
    return s.lower().strip()

def probe(url, expected_title=""):
    """Check this subject; generic application navigation is insufficient."""
    parts = urlsplit(str(url))
    if parts.scheme not in ("https", "http") or not parts.hostname:
        return ("INVALID", "invalid", "Pas d'URL HTTP publique")
    if parts.hostname.lower() in ("localhost", "127.0.0.1", "::1"):
        return ("INVALID", "invalid", "URL locale non consultable")
    try:
        req = urllib.request.Request(url, headers=HEADERS, method="GET")
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            code = res.status
            raw = res.read(READ_LIMIT)
            encoding = res.headers.get_content_charset() or "utf-8"
            decoded = raw.decode(encoding, errors="replace")
            parser = VisibleHTML()
            try:
                parser.feed(decoded)
                visible = normalized(" ".join(parser.parts))
            except Exception:
                visible = normalized(re.sub("<[^>]*>", " ", decoded))
            if any(term.replace("\u2019", "'") in visible for term in DEAD_TERMS):
                return (str(code), "closed", "Page employeur indiquant que l'offre n'est plus disponible")
            # Generic search pages/landing pages are not evidence for this specific stage.
            tokens = set(re.findall(r"[a-z0-9]+", unicodedata.normalize("NFD", expected_title).encode("ascii", "ignore").decode().lower())) - {"stage", "ingenieur", "de", "des", "du", "la", "le", "et", "f", "h"}
            page_head = unicodedata.normalize("NFD", visible[:2200]).encode("ascii", "ignore").decode().lower()
            subject_match = bool(tokens) and sum(t in page_head for t in tokens) / len(tokens) >= 0.5
            if subject_match and any(term in visible for term in POSITIVE_TERMS):
                return (str(code), "listing_visible", "Annonce avec action Postuler visible; soumission NON testée")
            return (str(code), "uncertain", "HTTP accessible mais annonce ou candidature non confirmée")
    except urllib.error.HTTPError as error:
        code = error.code
        if code in (404, 410):
            return (str(code), "likely_closed", "URL du poste introuvable (HTTP %d), vérifier manuellement" % code)
        if code in (401, 403, 429):
            return (str(code), "blocked", "Accès bot bloqué (HTTP %d) ; NE PAS conclure à l'expiration" % code)
        return (str(code), "uncertain", "HTTP %d, examen manuel nécessaire" % code)
    except (OSError, ValueError, UnicodeError, TimeoutError, socket.timeout) as err:
        return ("UNKNOWN", "blocked", "Erreur de connexion/délai; résultat incertain")

def export_csv(path, items, fields):
    with path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        for rec in items:
            row = dict(rec)
            for key in ("methods", "softwareTags", "tags"):
                if isinstance(row.get(key), list):
                    row[key] = " | ".join(row[key])
            writer.writerow(row)

def main():
    markup = INDEX.read_text(encoding="utf-8")
    jblock = JOBS_RE.search(markup)
    cblock = COMPANIES_RE.search(markup)
    if not jblock or not cblock:
        raise RuntimeError("Missing embedded database. Refusing to overwrite site.")
    jobs = json.loads(jblock.group(2))
    contacts = json.loads(cblock.group(2))
    if len(jobs) < 400:
        raise RuntimeError("Unexpected data loss: fewer than 400 historic entries")
    titles = {j.get("official_url") or j.get("url"): j.get("title", "") for j in jobs if j.get("url")}
    uniq = sorted(titles)
    print("Checking HTML job pages for %d unique links..." % len(uniq))
    with ThreadPoolExecutor(max_workers=3) as pool:
        checks = dict(zip(uniq, pool.map(lambda url: probe(url, titles[url]), uniq)))
    stats = {}
    for job in jobs:
        code, state, evidence = checks.get(job.get("official_url") or job.get("url"), ("INVALID", "invalid", "No link"))
        job["http_status"] = code
        job["http_checked_at"] = STAMP
        job["content_check_at"] = STAMP
        job["content_check_state"] = state
        job["content_evidence"] = evidence
        reviewed_state = job.get("human_review", "")
        if reviewed_state == "closed_confirmed":
            job["availability_state"] = "closed"
            job["closed"] = True
        elif state == "closed":
            job["availability_state"] = "closed"
            job["closed"] = True
            job["verification"] = "L'employeur indique que cette annonce n'est plus disponible (" + STAMP + ")."
        elif state == "likely_closed":
            # A 404 can be a false negative from an ATS/bot policy. Do NOT replace
            # an explicit, evidence-backed human review with auto-closed.
            if reviewed_state in ("posting_reviewed", "open_confirmed"):
                job["availability_state"] = "uncertain"
            else:
                job["availability_state"] = "likely_closed"
        elif state in ("blocked", "uncertain"):
            if job.get("availability_state") != "closed":
                job["availability_state"] = "uncertain"
        elif state == "listing_visible":
            if job.get("availability_state") not in ("closed",):
                job["availability_state"] = "listing_visible"
        for field in ("methods", "softwareTags", "tags"):
            if not isinstance(job.get(field), list):
                job[field] = []
        stats[job["availability_state"]] = stats.get(job["availability_state"], 0) + 1
        # A sourced recruiter post or HR page can differ from the job URL.
        # Keep source + scope; do not erase independently researched contacts.
        if job.get("contact_email") and not job.get("contact_source"):
            job["contact_email"] = ""
            job["contact_name"] = ""
    # Highlight closed/visible counts, not misleading HTTP 200 totals.
    stamp_line = "Contrôle des liens : " + STAMP
    markup = markup[:jblock.start(2)] + json.dumps(jobs, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c") + markup[jblock.end(2):]
    markup = re.sub(
        r'(<div id="daily-update"[^>]*>).*?(</div>)',
        lambda m: m.group(1) + htmlmod.escape(stamp_line) + m.group(2),
        markup, count=1, flags=re.S
    )
    INDEX.write_text(markup, encoding="utf-8")
    previous_csv = DATA / "internships.csv"
    if previous_csv.exists():
        with previous_csv.open(encoding="utf-8") as stream:
            job_fields = next(csv.reader(stream))
    else:
        job_fields = ["id", "company", "title", "city", "url"]
    for field in ("official_url", "contact_scope", "hr_contact_email", "hr_contact_source",
                  "hr_contact_note", "research_checked_at", "research_status", "research_source",
                  "research_note", "duplicate_of", "salary_verified", "salary_source"):
        if field not in job_fields:
            job_fields.append(field)
    contacts_csv = DATA / "contacts.csv"
    if contacts_csv.exists():
        with contacts_csv.open(encoding="utf-8") as stream:
            contact_fields = next(csv.reader(stream))
    else:
        contact_fields = ["name", "email", "person", "source", "notes"]
    export_csv(DATA / "internships.csv", jobs, job_fields)
    export_csv(DATA / "contacts.csv", contacts, contact_fields)
    print("Complete. Counts by evidence state:", stats)

if __name__ == "__main__":
    main()
