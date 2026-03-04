// scripts/runPipeline.js
async function runPipeline() {
  require("./extractDemo");
  require("./extractOnboarding");
}

module.exports = { runPipeline };
const fs = require("fs");
const path = require("path");
const { processDemoTranscript } = require("./extractDemo");
const { processOnboardingTranscript } = require("./extractOnboarding");

const demoFolder = path.join(__dirname, "..", "data", "demo_calls");
const onboardingFolder = path.join(__dirname, "..", "data", "onboarding_calls");

let summary = {
  demoProcessed: 0,
  onboardingProcessed: 0,
  onboardingUpdated: 0
};

console.log("Starting Clara Automation Pipeline...\n");

// -------- PROCESS DEMO CALLS --------
fs.readdirSync(demoFolder).forEach(file => {
  if (file.endsWith(".txt")) {
    processDemoTranscript(path.join(demoFolder, file));
    summary.demoProcessed++;
  }
});

// -------- PROCESS ONBOARDING CALLS --------
fs.readdirSync(onboardingFolder).forEach(file => {
  if (file.endsWith(".txt")) {
    const result = processOnboardingTranscript(
      path.join(onboardingFolder, file)
    );

    summary.onboardingProcessed++;

    if (result === "updated") {
      summary.onboardingUpdated++;
    }
  }
});

console.log("\n Pipeline Summary:");
console.log(`Demo files processed: ${summary.demoProcessed}`);
console.log(`Onboarding files processed: ${summary.onboardingProcessed}`);
console.log(`Accounts updated: ${summary.onboardingUpdated}`);
console.log("\n Pipeline execution complete.");