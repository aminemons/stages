/**
 * Google Apps Script — run once inside the existing Google Sheet:
 * Extensions > Apps Script > paste this file > Save > run installDailySync().
 *
 * Writes ONLY to "Flux automatique GitHub" and "Contacts publics".
 * It never alters "Suivi des candidatures", applicant CV files, or Gmail.
 * Reads only public CSVs from aminemons/stages; no external API keys.
 */
const STAGES_REPO = "https://raw.githubusercontent.com/aminemons/stages/main/data/";
const STAGES_SPREADSHEET = "16deUCsMSkwihvemRCcFGFRfiG0xPrQwPgQF4dEXUKag";

function syncCsv_(file, tab, minRows) {
  const url = STAGES_REPO + file + "?source=apps-script&at=" + Date.now();
  const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true, followRedirects: true});
  if (response.getResponseCode() !== 200) {
    throw new Error("Github CSV fetch failed " + file + " HTTP " + response.getResponseCode());
  }
  const rows = Utilities.parseCsv(response.getContentText("UTF-8"));
  if (rows.length <= minRows) {
    throw new Error("Unexpected drop in rows for " + file + " (" + rows.length + ")");
  }
  const headers = rows[0];
  if (!headers || headers.length < 10) {
    throw new Error("Invalid CSV schema in " + file);
  }
  const spreadsheet = SpreadsheetApp.openById(STAGES_SPREADSHEET);
  const sheet = spreadsheet.getSheetByName(tab);
  if (!sheet) throw new Error("Missing tab: " + tab);
  const width = Math.max(...rows.map(row => row.length));
  const data = rows.map(row => Array.from({length: width}, (_, i) => {
    let value = String(row[i] || "");
    // Prevent untrusted CSV from becoming a formula.
    return /^[=+\-@]/.test(value) ? "'" + value : value;
  }));
  if (sheet.getMaxRows() < data.length) sheet.insertRowsAfter(sheet.getMaxRows(), data.length - sheet.getMaxRows());
  if (sheet.getMaxColumns() < width) sheet.insertColumnsAfter(sheet.getMaxColumns(), width - sheet.getMaxColumns());
  sheet.clearContents();
  // Batch setValues for predictable quotas and meaningful errors
  for (let i = 0; i < data.length; i += 100) {
    const chunk = data.slice(i, i + 100);
    sheet.getRange(i + 1, 1, chunk.length, width).setValues(chunk);
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, width).setBackground("#173955").setFontColor("#ffffff").setFontWeight("bold");
  sheet.getRange(1, 1, data.length, width).setWrap(false);
  return data.length - 1;
}

function syncDaily() {
  const jobCount = syncCsv_("internships.csv", "Flux automatique GitHub", 400);
  const companyCount = syncCsv_("contacts.csv", "Contacts publics", 300);
  PropertiesService.getScriptProperties().setProperties({
    LAST_SYNC_UTC: new Date().toISOString(),
    LAST_SYNC_JOBS: String(jobCount),
    LAST_SYNC_CONTACTS: String(companyCount)
  });
  console.log("Synchronized " + jobCount + " internships, " + companyCount + " employers.");
}

function installDailySync() {
  // Install once. Running again replaces only this script's syncDaily triggers.
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "syncDaily").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("syncDaily").timeBased().everyDays(1).atHour(10).inTimezone("Africa/Algiers").create();
  syncDaily();
}

function showLastSync() {
  const p = PropertiesService.getScriptProperties();
  console.log(JSON.stringify({
    lastSync: p.getProperty("LAST_SYNC_UTC"),
    jobs: p.getProperty("LAST_SYNC_JOBS"),
    employers: p.getProperty("LAST_SYNC_CONTACTS")
  }));
}
