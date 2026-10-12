/**
 * Gmail + Gemini personalised internship application drafts.
 * Paste into the SAME Google Sheet Apps Script project as SheetSync.gs.
 *
 * USER SETUP (Script Properties, private):
 * GEMINI_API_KEY   = API key from https://aistudio.google.com/apikey
 * APP_PROFILE_TEXT = verified first-person applicant background, courses,
 *                    projects, motivation and availability; no invented skills.
 *
 * The Drive PDF CV file ID is entered per selected application in column M.
 *
 * States in "Suivi des candidatures", column B:
 *   PRÊT POUR BROUILLON  -> drafts only, never sends.
 *   BROUILLON À RELIRE  -> generated Gmail draft awaiting review.
 *   ENVOI APPROUVÉ      -> explicit approval; sendApproved() sends that draft.
 *   ENVOYÉ              -> already sent; never send again.
 *
 * Paste PUBLIC PROFESSIONAL e-mail and employer page proving it in K/N.
 * Put the actual FULL job-description text in L.
 */
const STAGES_APP_SHEET = "16deUCsMSkwihvemRCcFGFRfiG0xPrQwPgQF4dEXUKag";
const STAGES_APP_TAB = "Suivi des candidatures";
const STAGES_SOURCE_TAB = "Inventaire – 415 offres";
const STAGES_MODEL = "gemini-3.5-flash-lite";
const MAX_DRAFTS_PER_RUN = 4;
const MAX_APPROVED_SEND_PER_RUN = 3;

function getApplicationContext_() {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty("GEMINI_API_KEY");
  const profile = props.getProperty("APP_PROFILE_TEXT");
  if (!key || !profile || profile.length < 100) {
    throw new Error("Configure GEMINI_API_KEY and an accurate APP_PROFILE_TEXT (100+ chars) under Project Settings > Script Properties.");
  }
  const ss = SpreadsheetApp.openById(STAGES_APP_SHEET);
  return {ss, key, profile, queue: ss.getSheetByName(STAGES_APP_TAB), source: ss.getSheetByName(STAGES_SOURCE_TAB)};
}

function aiApplication_(key, profile, info, fullOffer) {
  const prompt = [
    "Rédige une candidature française professionnelle, concise, spécifique au poste.",
    "Réponds SEULEMENT par un JSON objet avec exactement subject, body, motivation.",
    "subject: objet d'email, body: email de 110 à 180 mots, motivation: lettre de 220 à 330 mots.",
    "Sois naturel, précis et humain; ne cite que les compétences du profil ci-dessous.",
    "N'invente aucune expérience, date, maîtrise logicielle, niveau de diplôme ou résultat.",
    "N'invente aucun nom de responsable; utilise Madame, Monsieur à défaut.",
    "Ne fais pas de promesses techniques impossibles; si inadéquation claire M2 vs M1,",
    "signale-le dans l'email sans mentir sur le niveau.",
    "Mentionne un détail technique réel du stage et explique précisément",
    "le lien avec un élément concret du profil candidat.",
    "PROFIL CANDIDAT (faits approuvés): " + profile,
    "ENTREPRISE: " + info.company,
    "STAGE: " + info.title,
    "NIVEAU PUBLIÉ: " + info.level,
    "SUJET CATALOGUE: " + info.tech,
    "ANNONCE COMPLÈTE: " + fullOffer.slice(0, 16000)
  ].join("\n");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(STAGES_MODEL) + ":generateContent";
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: {"x-goog-api-key": key},
    payload: JSON.stringify({
      contents:[{parts:[{text:prompt}]}],
      generationConfig:{responseMimeType:"application/json", temperature:0.35, maxOutputTokens:1800}
    }),
    muteHttpExceptions:true
  });
  if (res.getResponseCode() !== 200) {
    throw new Error("Gemini API HTTP " + res.getResponseCode() + " — " + res.getContentText().slice(0,350));
  }
  const obj = JSON.parse(res.getContentText());
  const generated = obj.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("") || "";
  let answer = JSON.parse(generated);
  for (const part of ["subject","body","motivation"]) {
    if (typeof answer[part] !== "string" || answer[part].trim().length < 25) {
      throw new Error("Gemini omitted valid " + part);
    }
  }
  return answer;
}

function makeMotivationPdf_(stage, content) {
  const title = "LM - " + stage.company + " - " + stage.id;
  const doc = DocumentApp.create(title);
  const body = doc.getBody();
  const header = body.appendParagraph("Lettre de motivation — " + stage.company);
  header.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  body.appendParagraph("Objet : " + stage.title);
  body.appendParagraph("");
  for (const para of content.split(/\n\s*\n/).filter(Boolean)) body.appendParagraph(para);
  doc.saveAndClose();
  const pdfBlob = DriveApp.getFileById(doc.getId()).getAs(MimeType.PDF).setName(title + ".pdf");
  const pdf = DriveApp.createFile(pdfBlob);
  return {blob: pdfBlob, url: pdf.getUrl()};
}

function jobLookup_(ss) {
  const source = ss.getSheetByName(STAGES_SOURCE_TAB);
  const data = source.getDataRange().getDisplayValues().slice(1);
  const result = new Map();
  for (const row of data) {
    if (row[0]) result.set(row[0], {id:row[0],company:row[4],title:row[5],level:row[8],tech:row[11]});
  }
  return result;
}

function prepareDrafts() {
  const {ss,key,profile,queue} = getApplicationContext_();
  const lookup = jobLookup_(ss);
  const data = queue.getDataRange().getDisplayValues();
  let made=0;
  for (let i=1;i<data.length && made<MAX_DRAFTS_PER_RUN;i++) {
    const row=data[i];
    if (row[1] !== "PRÊT POUR BROUILLON") continue;
    try {
      const stage = lookup.get(row[0]);
      const email = String(row[10] || "").trim();
      const fullOffer = String(row[11] || "");
      const cvId = String(row[12] || "").trim();
      const contactEvidence = String(row[13] || "").trim();
      if (!stage) throw new Error("Offer ID not found.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Missing verified professional email in K.");
      if (fullOffer.length < 250) throw new Error("Paste the complete official job description into L (250+ chars).");
      if (!/^https:\/\//.test(contactEvidence)) throw new Error("Provide official/public email evidence URL in N.");
      if (!cvId) throw new Error("Enter a PDF CV's Google Drive file ID in M.");
      const cvFile = DriveApp.getFileById(cvId);
      if (cvFile.getMimeType() !== MimeType.PDF) throw new Error("CV must be an existing PDF in Drive.");
      const draftContent = aiApplication_(key, profile, stage, fullOffer);
      const letter = makeMotivationPdf_(stage, draftContent.motivation);
      const draft = GmailApp.createDraft(email, draftContent.subject, draftContent.body, {
        attachments:[cvFile.getBlob(),letter.blob],
        name:"Candidature stage"
      });
      queue.getRange(i+1,2).setValue("BROUILLON À RELIRE");
      queue.getRange(i+1,15,1,4).setValues([[draft.getId(),letter.url,new Date(),""]]);
      made++;
    } catch(error) {
      queue.getRange(i+1,18).setValue(String(error).slice(0,500));
      // Leave state untouched so the user can fix the row.
    }
  }
  console.log("Gmail drafts prepared: " + made + " — none sent.");
}

function sendApproved() {
  const ss=SpreadsheetApp.openById(STAGES_APP_SHEET);
  const q=ss.getSheetByName(STAGES_APP_TAB);
  const values=q.getDataRange().getDisplayValues();
  let sent=0;
  for (let i=1;i<values.length && sent<MAX_APPROVED_SEND_PER_RUN;i++) {
    const row=values[i];
    if (row[1] !== "ENVOI APPROUVÉ") continue;
    try {
      const email=String(row[10] || "").trim().toLowerCase();
      const draftId=String(row[14] || "").trim();
      if (!email || !draftId) throw new Error("Email or draft ID missing");
      const draft=GmailApp.getDraft(draftId);
      const to=draft.getMessage().getTo().trim().toLowerCase();
      if (to !== email) throw new Error("Recipient changed since draft generation; refused to send");
      draft.send();
      q.getRange(i+1,2).setValue("ENVOYÉ");
      q.getRange(i+1,4).setValue(new Date());
      q.getRange(i+1,18).setValue("");
      sent++;
    } catch(error) {
      q.getRange(i+1,18).setValue("Send failed: " + String(error).slice(0,450));
    }
  }
  console.log("Explicitly approved applications sent: " + sent);
}

function installApplicationTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(t=>["prepareDrafts","sendApproved"].includes(t.getHandlerFunction()))
    .forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("prepareDrafts").timeBased().everyDays(1).atHour(11)
    .inTimezone("Africa/Algiers").create();
  ScriptApp.newTrigger("sendApproved").timeBased().everyDays(1).atHour(12)
    .inTimezone("Africa/Algiers").create();
  console.log("Daily cloud triggers installed. ONLY ENVOI APPROUVÉ rows can send.");
}
