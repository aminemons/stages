import json
import re
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
m=re.search(r'(<script id="jobdata" type="application/json">)(.*?)(</script>)',s,re.S)
assert m
jobs=json.loads(m.group(2))
by_id={j["id"]:j for j in jobs}
for name in ("audit-2026-10-13-patch.json","corrections-2026-10-13.json","new-2026-10-13.json"):
    data=json.loads((Path("data")/name).read_text())
    for key,fields in data.get("updates",{}).items():
        if key in by_id and by_id[key].get("audit_attempt_at","")<data["date"]:
            by_id[key].update(fields)
    for job in data.get("additions",[]):
        if job["id"] not in by_id:
            jobs.append(job)
            by_id[job["id"]]=job
s=s[:m.start(2)]+json.dumps(jobs,ensure_ascii=False)+s[m.end(2):]
p.write_text(s,encoding="utf-8")
