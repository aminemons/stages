# Internship dashboard: daily sync + tailored applications
**France, M1 Matériaux Fonctionnels / computational modelling**
Updated: 12 October 2026

## Current real status (do not mistake inventory for verified vacancies)
- Live deployment: https://materials-internships-vercel.vercel.app/
- GitHub repository: https://github.com/aminemons/stages
- Existing Google Sheet: https://docs.google.com/spreadsheets/d/16deUCsMSkwihvemRCcFGFRfiG0xPrQwPgQF4dEXUKag/edit
- Historical internship database: **415 records**. Only **7 official posting pages** were manually checked on 12 October; application form completion has NOT been verified. They are not all active vacancies.
- Company prospect list: **349 records**. Exactly **5 publicly sourced work emails** are recorded at the time of writing; only some of these are relevant to internship applications.
- Website rendering bug from absent data arrays in last row was repaired and pushed to main.

## 1. Create these free applicant accounts first
Do this on the **applicant's own email**. Who is the applicant: Asmaa (M1 computational materials) or Amine (micro/nanoelectronics)? The profile and CV MUST correspond to the person actually applying.

1. EDF candidate portal: https://www.edf.fr/edf-recrute/etre-etudiant
2. CEA space: https://www.emploi.cea.fr/homepage.aspx
3. CNRS account/alerts: https://emploi.cnrs.fr/
4. Safran jobs portal: https://www.safran-group.com/fr/faq/comment-postuler-stage-alternance-safran (a submitted email alone DOES NOT count as an application there).
5. Google account with Gmail + Drive, connected to the Sheet above.
6. Optional: LinkedIn Jobs and major employer portals found on each genuine listing.

For every application, check **M1/Bac+4 accepted**, the actual deadline, language, required software, start month, duration and whether the website still accepts submissions.

## 2. What updates automatically without leaving a personal PC on?
The repository includes:
- .github/workflows/daily-link-audit.yml — scheduled **07:00 UTC / 08:00 Algeria**. A GitHub-hosted runner, not a home PC, executes it.
- scripts/daily_links.py — makes light HTTP HEAD/GET checks (up to four concurrent requests, nine-second timeout); records HTTP 200/403/404/etc. No authentication, no applications. **HTTP 200 never means the internship is open.**
- data/internships.csv and data/contacts.csv — public feeds, regenerated whenever the Action runs.
- index.html — updated with the latest technical check date/status; Vercel rebuilds automatically from main if your integration is active.

To check it runs:
1. Open https://github.com/aminemons/stages/actions .
2. Select **Daily internship URL audit**.
3. Choose **Run workflow** on main once for an initial test. Then review the job output; if it fails, the last deployed version remains.
4. If push fails with a permissions error, open repository Settings → Actions → General → Workflow permissions and enable **Read and write permissions** (if available), then rerun.
5. Scheduled GitHub Actions jobs may start later than their cron time. They do not guarantee an exact 08:00 refresh.
6. New internships are NOT found by the HTTP check script; the existing ChatGPT morning research task is separately instructed to search, verify, and push newly found offers. It is independent and subject to tool execution and account access.

## 3. Google Sheet: use a FREE cloud trigger, one-time installation
The Sheet currently contains populated "Inventaire – 415 offres", "Contacts publics", "Suivi des candidatures", "Flux automatique GitHub", and "Mode d'emploi" tabs.

The GitHub feed already contains all 415 records. To keep it in sync reliably, install the Apps Script on the Google account that owns the Sheet:

1. Open the Sheet → **Extensions → Apps Script**.
2. In the code editor, paste the entire contents of [automation/SheetSync.gs](../automation/SheetSync.gs) in a code file. Save.
3. Run the **installDailySync** function **once** from the function selector (top toolbar). Authorize permissions to edit **this spreadsheet** and fetch the public CSV from GitHub.
4. The first run immediately refreshes both public-data tabs, replacing any broken IMPORTDATA formula. It also installs a daily Google-cloud trigger around 10:00–11:00 Algeria time.
5. Check **Executions** in Apps Script for any errors. Run **showLastSync** to inspect row counts and last timestamp.
6. The **Suivi des candidatures** tab is intentionally NEVER overwritten by SheetSync; it keeps your notes.
7. To share: Sheet → Share → General access → **Anyone with the link** → Viewer (only if you choose to publish it). Without that step, the URL can only be opened by authorized Google users.

GitHub Actions and Apps Script both run in the cloud; the recipient's computer can be turned off. The online Sheet remains private until YOU change share settings. Do not store a candidate's CV in the public repo.

## 4. Only 5 public professional emails are actually sourced
Public does **not** imply a recruiter for every stage. Sources:
- EDF R&D: **mohamad.houssini@edf.fr** — contact named for the EDF stage on step/touch voltages, electromagnetics and Python/CST. This is NOT the contact for the EDF battery modelling stage.
  https://www.edf.fr/edf-recrute/offre/detail/2026-183283
- EDF R&D: **armand.wils@edf.fr** — contact named for another EDF stage: two-channel synthesizer, Raspberry Pi, Si5351, Python. Not necessarily relevant to materials.
  https://www.edf.fr/edf-recrute/offre/detail/2026-183817
- Michelin: **communication-recrutement@michelin.com** — Michelin's general recruitment communication contact, listed on its official recruitment cookie/contact page; not a specific internship supervisor.
  https://recrutement.michelin.fr/politique-de-cookies
- RSK France: **recrutements@rskgroup.fr** — official careers email; employer works in environment, engineering and sustainability, not an identified materials-simulation offer.
  https://rskgroup.fr/carrieres/
- Soli Énergie: **recrutement@soli-energie.com** — explicitly advertised for a February 2027 photovoltaic engineering internship. The posting specifies "stage de fin d'études", so **do not classify it as M1 eligible without written confirmation**.
  https://www.soli-energie.com/offres-d-emploi/stagiaire-ingenieur-etudes-photovoltaique-b2b

No responsible person's email should be guessed using firstname.lastname patterns. For EDF, Safran, CEA and others, use the application form if that is the instructed route. Never email the two EDF contacts about unrelated offers as if they managed those teams.

## 5. Personalized applications WITHOUT a paid GPT API
**ChatGPT Free (web)** can help manually rewrite letters but it is **not an unattended free API** that an Apps Script can call. For cloud automation use the documented **Gemini API free tier**, if available to your API key/account/region, with a model such as **gemini-3.5-flash-lite**. Free quotas, pricing and usage conditions can change; check https://ai.google.dev/gemini-api/docs/pricing . Free-tier inputs may be used to improve Google products; only include candidate information with their permission.

The repository contains [automation/ApplicationDrafts.gs](../automation/ApplicationDrafts.gs). This script:
- drafts an **individual French email** (~110–180 words) referencing the employer and actual stage;
- drafts a **motivation letter** (~220–330 words), renders it to **PDF** via Google Docs, and attaches the PDF;
- attaches the candidate's **private PDF CV** from Google Drive;
- creates a draft in the candidate's **own Gmail**, but does NOT send by default;
- sends **only** when the exact row status is deliberately changed to **ENVOI APPROUVÉ**. It limits automatic sends to 3 per execution and refuses changed recipients.

### Detailed setup for any new computer
1. Sign in to the **applicant's** Google account (not necessarily the site owner's) on the other computer.
2. Open the existing Google Sheet. Ensure the account has edit access. For Apps Script triggers to run from the applicant's Gmail, the script project must be authorized by that applicant.
3. Upload the applicant's final **ATS-compatible CV.pdf** to **private Google Drive**. Copy its file ID from the Drive link (the string between /d/ and /view). Do NOT put its content or link in a public GitHub file.
4. Open https://aistudio.google.com/apikey and generate an API key. Check your Gemini free tier for your account. Do NOT save the key in GitHub or spreadsheet cells.
5. From the Sheet: Extensions → Apps Script. Add a new file, paste [automation/ApplicationDrafts.gs](../automation/ApplicationDrafts.gs), Save.
6. Open **Project Settings → Script Properties**, create:
   - **GEMINI_API_KEY** = the AI Studio API key;
   - **APP_PROFILE_TEXT** = a factual 150–500 word description of the applicant's education, technical projects, tools she/he can genuinely use, exact internship dates, and a signature name. Do not invent COMSOL, ANSYS, Abaqus, etc.
7. In tab **Suivi des candidatures**, locate the desired offer ID (column A) and fill:
   - **K**: publicly documented professional email, copied exactly;
   - **L**: full official job-post text (not just the website's short summary);
   - **M**: CV PDF's Google Drive file ID;
   - **N**: HTTPS source proving that **specific** email is meant to receive applications or appropriate inquiries.
8. Change **B** of that row to **PRÊT POUR BROUILLON**.
9. In Apps Script select **prepareDrafts**, click **Run**. Authorize Gmail draft creation, Drive, Docs and external Gemini API access (if requested). A successful row becomes **BROUILLON À RELIRE**. Column O stores Gmail draft ID, P stores the letter PDF's Drive URL, Q timestamp, R error if any.
10. In Gmail → **Drafts** inspect the email, company facts, academic level, CV attachment, motivation PDF, recipient, and dates. Edit or delete the draft if incorrect.
11. When fully satisfied, return to that row and type **ENVOI APPROUVÉ** into column B. Run **sendApproved** manually to send only approved drafts. On success the row becomes **ENVOYÉ**.
12. To run in the cloud each day, run **installApplicationTriggers** once. This schedules draft preparation around 11:00 Algeria and checks **approved-only** sends around 12:00 Algeria. Trigger execution may be delayed. Maximum: 4 drafts + 3 explicitly approved sends per run.
13. If there is **no published email**, leave K empty and use the employer's recruitment portal manually. Automated emails are NOT a substitute for mandatory portals.

### Suggested high-quality prompt constraints for the model
- Quote one **real requirement** from the original posting and connect it to **one real candidate project**.
- Include one precise company/team reason; never generic praise or the same email for all.
- Never claim mastery of a tool absent from the applicant's CV.
- Never state "application submitted" until portal confirmation or mail sent.
- Use the applicant's *actual* first-person voice and realistic availability.
- If M1 is excluded, do not disguise the qualification.

## 6. Long-term maintenance / evidence rules
Track three separate concepts for each URL:
1. **HTTP technically reachable** — tested by GitHub Actions, not proof that posting is live.
2. **Employer stage description confirmed** — manually reviewed posting page with company, title, and grade level.
3. **Application currently possible** — hiring platform actually accepts submissions; forms may require manual login. If not tested, status is UNKNOWN.

Never inflate confirmed counts by including historical positions, wrong-year listings, unrelated companies, or stale job aggregators. Human review is required for claimed M1 eligibility and employer direct-contact email.

## What has NOT been done
- No automatic Gmail messages have been sent, nor accounts registered.
- No private CV uploaded to the public GitHub repo.
- No guarantee that 408 older offerings are live, or that automatic HTTP audits will resolve private job portals.
- The Sheet's 10:00 automatic sync and Gmail application triggers require the applicant/owner to **authorize Apps Script once**. Their existence in the repository alone does not enable them.
