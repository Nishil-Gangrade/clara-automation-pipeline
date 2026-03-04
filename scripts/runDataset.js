// scripts/runDataset.js

const fs = require("fs");
const path = require("path");

const { processDemoTranscript } = require("./extractDemo");
const { processOnboardingTranscript } = require("./extractOnboarding");

const demoFolder = path.join(__dirname, "..", "data", "demo_calls");
const onboardingFolder = path.join(__dirname, "..", "data", "onboarding_calls");

function runDemoPipeline() {
  console.log(" Running DEMO pipeline...\n");

  const files = fs.readdirSync(demoFolder);

  files.forEach((file) => {
    if (file.endsWith(".txt")) {
      const filePath = path.join(demoFolder, file);

      try {
        console.log(`Processing demo file: ${file}`);
        processDemoTranscript(filePath);
      } catch (error) {
        console.error(`Failed processing demo file: ${file}`);
        console.error(error.message);
      }
    }
  });
}

function runOnboardingPipeline() {
  console.log("\n Running ONBOARDING pipeline...\n");

  const files = fs.readdirSync(onboardingFolder);

  files.forEach((file) => {
    if (file.endsWith(".txt")) {
      const filePath = path.join(onboardingFolder, file);

      try {
        console.log(`Processing onboarding file: ${file}`);
        processOnboardingTranscript(filePath);
      } catch (error) {
        console.error(`Failed processing onboarding file: ${file}`);
        console.error(error.message);
      }
    }
  });
}

function runPipeline() {
  console.log("=======================================");
  console.log("CLARA AUTOMATION PIPELINE - DATASET RUN");
  console.log("=======================================\n");

  runDemoPipeline();
  runOnboardingPipeline();

  console.log("\n Dataset processing complete.");
}

if (require.main === module) {
  runPipeline();
}

module.exports = { runPipeline };