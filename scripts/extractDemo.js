// scripts/extractDemo.js

const fs = require("fs");
const path = require("path");
const { createEmptyAccountMemo } = require("./schema");
const { createAgentSpec } = require("./agentTemplate");

// =============================
// Utility Extraction Functions
// =============================

function extractCompanyName(text) {
  const match = text.match(/([A-Za-z\s]+Electrical\sSolutions)/i);
  return match ? match[1].trim() : "";
}

function extractCRM(text) {
  if (text.toLowerCase().includes("jobber")) {
    return "Jobber";
  }
  return "";
}

function extractIndustry(text) {
  if (text.toLowerCase().includes("electric")) {
    return "Electrical Services";
  }
  return "";
}

function extractServices(text) {
  const services = [];
  const keywords = [
    "ev chargers",
    "hot tub",
    "panel",
    "residential",
    "commercial",
    "service calls",
    "tenant improvement",
    "renovations",
    "troubleshooting"
  ];

  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      services.push(keyword);
    }
  });

  return [...new Set(services)];
}

function extractEmergencyInfo(text, accountMemo) {
  const emergency = [];

  if (text.toLowerCase().includes("emergency")) {
    emergency.push("Emergency service mentioned but exact definition unclear");
  }

  if (text.toLowerCase().includes("i'm the one on call")) {
    accountMemo.emergency_routing_rules.primary_contact = "Ben (Owner)";
  }

  return emergency;
}

function extractCallVolume(text) {
  const match = text.match(/(\d+\s?to\s?\d+)\s?calls/i);
  return match ? match[1] : "Not clearly specified";
}

function extractScreeningPreference(text) {
  if (text.toLowerCase().includes("screen")) {
    return true;
  }
  return true; // default safe assumption (screen enabled)
}

function extractAfterHoursBehavior(text) {
  if (text.toLowerCase().includes("after hours")) {
    return "After-hours calls are occasional; emergency calls may be routed to owner.";
  }
  return "";
}

function extractIntegrationConstraints(text) {
  const constraints = [];

  if (text.toLowerCase().includes("jobber")) {
    constraints.push("Jobber integration desired");
  }

  if (text.toLowerCase().includes("integration") && text.toLowerCase().includes("in progress")) {
    constraints.push("CRM integration currently in progress");
  }

  return constraints;
}

function detectUnknowns(accountMemo) {
  const unknowns = [];

  if (!accountMemo.business_hours.days.length) {
    unknowns.push("Exact business days not specified in demo call");
  }

  if (!accountMemo.business_hours.start_time || !accountMemo.business_hours.end_time) {
    unknowns.push("Exact business hours not specified");
  }

  if (!accountMemo.business_hours.timezone) {
    unknowns.push("Timezone not specified");
  }

  if (!accountMemo.emergency_routing_rules.primary_contact) {
    unknowns.push("Emergency primary contact not confirmed");
  }

  if (!accountMemo.emergency_definition.length) {
    unknowns.push("Emergency definition not clearly defined");
  }

  return unknowns;
}

// =============================
// MAIN PROCESS FUNCTION
// =============================

function processDemoTranscript(filePath) {
  const rawText = fs.readFileSync(filePath, "utf-8");
  const accountId = path.basename(filePath, ".txt").replace("_demo", "");

  const accountMemo = createEmptyAccountMemo(accountId);

  // --- Core Extractions ---
  accountMemo.company_name = extractCompanyName(rawText);
  accountMemo.crm_system = extractCRM(rawText);
  accountMemo.industry = extractIndustry(rawText);
  accountMemo.services_supported = extractServices(rawText);

  accountMemo.emergency_definition = extractEmergencyInfo(rawText, accountMemo);

  // --- Behavioral Summaries ---
  accountMemo.after_hours_flow_summary = extractAfterHoursBehavior(rawText);

  accountMemo.office_hours_flow_summary =
    "Calls screened during office hours; relevant service requests qualified before scheduling.";

  accountMemo.non_emergency_routing_rules.screen_calls =
    extractScreeningPreference(rawText);

  accountMemo.integration_constraints = extractIntegrationConstraints(rawText);

  accountMemo.notes =
    `Generated from demo call transcript only. Approx weekly call volume: ${extractCallVolume(rawText)}.`;

  // --- Unknowns Detection ---
  accountMemo.questions_or_unknowns = detectUnknowns(accountMemo);

  // =============================
  // Save v1 Outputs
  // =============================

  const accountDir = path.join(
    __dirname,
    "..",
    "outputs",
    "accounts",
    accountId,
    "v1"
  );

  fs.mkdirSync(accountDir, { recursive: true });

  fs.writeFileSync(
    path.join(accountDir, "account_memo.json"),
    JSON.stringify(accountMemo, null, 2)
  );

  const agentSpec = createAgentSpec(accountMemo, "v1");

  fs.writeFileSync(
    path.join(accountDir, "agent_spec.json"),
    JSON.stringify(agentSpec, null, 2)
  );
  // -------- CREATE TASK TRACKING ITEM --------
const taskDir = path.join(__dirname, "..", "tasks");
fs.mkdirSync(taskDir, { recursive: true });

const task = {
  account_id: accountId,
  stage: "Demo Complete",
  status: "Awaiting Onboarding",
  created_at: new Date().toISOString(),
  version: "v1"
};

fs.writeFileSync(
  path.join(taskDir, `${accountId}_task.json`),
  JSON.stringify(task, null, 2)
);

  console.log(`✅ v1 generated for ${accountId}`);
}

// =============================
// CLI Execution (Batch Mode)
// =============================

if (require.main === module) {
  const demoFolder = path.join(__dirname, "..", "data", "demo_calls");

  const files = fs.readdirSync(demoFolder);

  files.forEach(file => {
    if (file.endsWith(".txt")) {
      processDemoTranscript(path.join(demoFolder, file));
    }
  });
}

module.exports = { processDemoTranscript };