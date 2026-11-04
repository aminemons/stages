# Research and maintenance ledger — 2026-11-04

## Outcome
No new unique experimental M1 materials internship has been committed in this pass. The individually body-reviewed cumulative baseline remains 36/400, subject to subsequent reconciliation; 364 to target. Do not increment the materials counter from the leads below.

## Employer descriptions inspected
- CEA 2026-42053 — https://www.emploi.cea.fr/offre-de-emploi/imprimer-fiche-emploi-stage-4-mois-rheologie-polymeres-pv-h-f_42053.aspx — four-month experimental polymer rheology and PV lamination, M1 explicit, 1 February 2027; data treatment Excel/MATLAB/Python alternatives, not a programming-led role. Already catalogued.
- CEA 2026-41966 — https://www.emploi.cea.fr/job/print-job-form-stage-bac-4-materiaux-et-energie-h-f_41966.aspx — tin-based transparent conducting oxide PVD and optical/electrical characterization, M1 explicit, 1 March 2027; already catalogued.
- CEA 2026-41981 — https://www.emploi.cea.fr/job/emploi-stage-bac-4-photovoltaique-pour-le-spatial-h-f_41981.aspx?LCID=2057 — FT-IR characterization of silicon defects for space PV, M1 explicit, 5–6 months; already catalogued.
- EDF 2026-184898 — https://www.edf.fr/edf-recrute/offre/detail/2026-184898 — metallography, SEM and dilatometry of bimetallic joints, Bac+4/5, February 2027, EUR 1,230–1,557 gross/month; already catalogued.
- Saint-Gobain FRA40551 — https://joinus.saint-gobain.com/fr/fra/tpr/i/44507/327123/stage-ingenieur-process-support-aux-projets-dindustrialisation-dune-nouvelle — Rantigny, February 2027, 4–6 months, EUR 1,200–1,500/month, Bac+4/5 Master accepted. Excluded from experimental materials shortlist: primary duties concern engineering documentation, feedback, Excel, AI-assisted writing and furnace project support, not hands-on materials testing.
- CEA 2026-42158 — https://www.emploi.cea.fr/job/print-job-form-stage-bac-5-developpement-de-nouveaux-ionomeres-biosources-h-f_42158.aspx — polymer membrane synthesis and characterization, but Master 2 explicitly required. Excluded.
- CEA 2026-41678 — https://www.emploi.cea.fr/offre-de-emploi/emploi-stage-bac-5-chimie-formulation-h-f_41678.aspx — UV polymer electrolyte formulation, Master 2 explicitly required. Excluded.
- CEA 2026-41992 — https://www.emploi.cea.fr/offre-de-emploi/imprimer-fiche-emploi-stage-developpement-et-caracterisation-physico-chimique-de-nanogels-h-f-_41992.aspx — Labège nanogel formulation, final-year engineering/M2 only. Excluded.
- CEA 2026-42155 — https://www.emploi.cea.fr/offre-de-emploi/imprimer-fiche-emploi-caracterisation-de-photoresines-poreuses-innovantes-pour-des-applications-de-lithographie-h-f_42155.aspx — Grenoble photoresist characterization, M2 explicitly required. Excluded.
- CEA 2026-41413 — https://www.emploi.cea.fr/offre-de-emploi/imprimer-fiche-emploi-stage-modelisation-de-la-diffusion-de-l-arsenic-dans-les-photodiodes-pour-imageurs-infrarouges-h-f_41413.aspx — M1 accepted but Silvaco model calibration, C and Python central; exclude from dedicated experimental tab.

## Availability caveat
CEA 2026-41435 photoluminescence instrumentation: one official CEA URL currently shows the explicit banner “L'offre que vous essayez d'afficher n'existe pas ou plus sur ce site” despite retaining a historical offer body. This is a conflict; do not infer current availability from preserved text. https://www.emploi.cea.fr/offre-de-emploi/emploi-stage-optimisation-instrumentale-d-un-banc-de-cartographie-photoluminescence-h-f_41435.aspx?LCID=1036 . Needs canonical URL comparison and manual status reconciliation.

## Infrastructure
The scheduled GitHub Actions 'Daily internship URL audit' run 41656955422 on 3 November failed at the dashboard smoke test before the link audit. The error was an absent 'added' control in scripts/check_dashboard.cjs DOM mock, not a demonstrated failure of actual public UI. Added the missing test fixture and configured workflow path triggering for the smoke-test file. The follow-up Actions run must be inspected for its result; a queued/in-progress run is not a passing audit.

## Data integrity baseline
As read 4 November before any potential concurrent audit write: 488 unique records in Sheets 'Flux automatique GitHub'; 511 data rows/508 unique IDs in 'Inventaire – 415 offres'; 'Contacts publics' unchanged. 'Suivi des candidatures' was never written. Previous seven missing original IDs stage-410 through stage-416 remain unresolved. No emails or applications sent.
