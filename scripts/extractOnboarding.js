// scripts/extractOnboarding.js

const fs = require("fs");
const path = require("path");
const { mergeAccountMemo } = require("./mergePatch");
const { createAgentSpec } = require("./agentTemplate");
const { generateChangelog } = require("./generateChangelog");


// =======================
// Extraction Logic
// =======================

function extractConfirmedBusinessHours(text) {
  const lower = text.toLowerCase();

  const timeMatch = lower.match(
    /(\d{1,2}\s?(?:am|pm))\s?(?:to|-)\s?(\d{1,2}\s?(?:am|pm))/
  );

  if (!timeMatch) return null;

  let days = [];

  if (lower.includes("monday") && lower.includes("friday")) {
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  }

  return {
    days,
    start_time: timeMatch[1].replace(/\s+/g, ""),
    end_time: timeMatch[2].replace(/\s+/g, "")
  };
}

function extractTimezone(text) {
  const lower = text.toLowerCase();

  if (lower.includes("calgary")) return "MST";
  if (lower.includes("est")) return "EST";
  if (lower.includes("pst")) return "PST";

  return null;
}


// =======================
// Main Processor
// =======================

function processOnboardingTranscript(filePath) {
  const rawText = fs.readFileSync(filePath, "utf-8");
  const accountId = path.basename(filePath, ".txt").replace("_onboarding", "");

  const v1Path = path.join(
    __dirname,
    "..",
    "outputs",
    "accounts",
    accountId,
    "v1",
    "account_memo.json"
  );

  const v2Path = path.join(
    __dirname,
    "..",
    "outputs",
    "accounts",
    accountId,
    "v2",
    "account_memo.json"
  );

  if (!fs.existsSync(v1Path)) {
    console.error("❌ v1 does not exist for this account");
    return;
  }

  // ✅ USE v2 as base if it exists (TRUE IDEMPOTENCY)
  let baseMemo;

  if (fs.existsSync(v2Path)) {
    baseMemo = JSON.parse(fs.readFileSync(v2Path));
  } else {
    baseMemo = JSON.parse(fs.readFileSync(v1Path));
  }

  const updates = {};

  // -------- BUSINESS HOURS PATCH --------
  const businessHours = extractConfirmedBusinessHours(rawText);
  const timezone = extractTimezone(rawText);

  if (businessHours || timezone) {
    updates.business_hours = {
      ...baseMemo.business_hours
    };

    if (businessHours) {
      if (businessHours.days?.length) {
        updates.business_hours.days = businessHours.days;
      }

      if (businessHours.start_time) {
        updates.business_hours.start_time = businessHours.start_time;
      }

      if (businessHours.end_time) {
        updates.business_hours.end_time = businessHours.end_time;
      }
    }

    if (timezone) {
      updates.business_hours.timezone = timezone;
    }
  }

  // -------- MERGE --------
  const { v2Memo, changes } = mergeAccountMemo(baseMemo, updates);

  // -------- IDEMPOTENCY CHECK --------
  if (changes.length === 0) {
  console.log(`⚠ No changes detected for ${accountId}. Skipping v2 regeneration.`);
  return "no-change";
}

  // -------- CLEAN RESOLVED UNKNOWN QUESTIONS --------
  v2Memo.questions_or_unknowns = v2Memo.questions_or_unknowns.filter(q => {
    const lower = q.toLowerCase();

    if (businessHours && lower.includes("business")) return false;
    if (timezone && lower.includes("timezone")) return false;

    return true;
  });

  // -------- SAVE v2 --------
  const v2Dir = path.join(
    __dirname,
    "..",
    "outputs",
    "accounts",
    accountId,
    "v2"
  );

  fs.mkdirSync(v2Dir, { recursive: true });

  fs.writeFileSync(
    path.join(v2Dir, "account_memo.json"),
    JSON.stringify(v2Memo, null, 2)
  );

  const agentSpec = createAgentSpec(v2Memo, "v2");

  fs.writeFileSync(
    path.join(v2Dir, "agent_spec.json"),
    JSON.stringify(agentSpec, null, 2)
  );

  // -------- CHANGELOG --------
  generateChangelog(accountId, changes);

  console.log(`✅ v2 generated for ${accountId}`);
return "updated";
}


// =======================
// CLI
// =======================

if (require.main === module) {
  const onboardingFolder = path.join(__dirname, "..", "data", "onboarding_calls");

  const files = fs.readdirSync(onboardingFolder);

  files.forEach(file => {
    if (file.endsWith(".txt")) {
      processOnboardingTranscript(path.join(onboardingFolder, file));
    }
  });
}

module.exports = { processOnboardingTranscript };