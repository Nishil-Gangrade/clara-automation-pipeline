Clara Automation Pipeline
Overview

This project implements an automated pipeline that converts customer conversations (demo calls and onboarding calls) into structured operational configurations for a Retell AI voice agent used by Clara Answers.

The system processes demo call transcripts to generate a preliminary agent configuration (v1). Later, onboarding call transcripts are processed to update the same account configuration (v2), reflecting confirmed operational details such as business hours, routing logic, and other constraints.

The pipeline is designed to simulate the real onboarding automation workflow used by Clara, where unstructured conversations must be transformed into structured operational rules and agent prompts.

The solution satisfies the assignment requirement of building a zero-cost automation pipeline using reproducible tools and local execution.

Architecture and Data Flow

The system consists of four main components.

1. Data Ingestion

Input transcripts are placed into the dataset folders:

data/demo_calls
data/onboarding_calls

Each transcript represents a customer account interaction.

Example file naming:

bens_electrical_demo.txt
bens_electrical_onboarding.txt

The account ID is derived from the file name.

2. Demo Pipeline (v1 Generation)

The demo pipeline processes transcripts to extract business information and generate a preliminary configuration.

Process flow:

Demo Transcript
        ↓
Extraction Logic
        ↓
Account Memo JSON
        ↓
Agent Draft Specification
        ↓
Stored in outputs/accounts/<account_id>/v1

Files produced:

account_memo.json
agent_spec.json

These represent the initial agent configuration based only on demo information.

Missing information is not guessed and is instead recorded under:

questions_or_unknowns
3. Onboarding Pipeline (v2 Update)

The onboarding pipeline updates the existing account configuration using new operational details provided during onboarding.

Process flow:

Onboarding Transcript
        ↓
Extraction Logic
        ↓
Merge With Existing Memo
        ↓
Version Update (v1 → v2)
        ↓
Changelog Generation

Files produced:

outputs/accounts/<account_id>/v2/account_memo.json
outputs/accounts/<account_id>/v2/agent_spec.json
changelog/<account_id>_changes.json

The system preserves the original v1 configuration and records only the confirmed changes.

4. Automation Orchestration

Automation is managed using n8n, which triggers the pipeline execution.

Workflow:

Manual Trigger
      ↓
HTTP Request → POST /run-pipeline
      ↓
Pipeline Execution

This allows the entire dataset to be processed automatically.

The workflow export is located in:

/workflows/myworkflow.json
5. Monitoring Dashboard

A lightweight dashboard is provided to visualize pipeline status.

The dashboard shows:

processed accounts

v1 generation status

v2 generation status

last update timestamp

The dashboard is served through the Express server and available at:

http://localhost:3000
How to Run the Project Locally
1. Install Dependencies

Ensure Node.js is installed.

Install project dependencies:

npm install
2. Start the Backend Server

Run the server:

node server.js

The server will start at:

http://localhost:3000

This provides:

pipeline API

dashboard UI

monitoring endpoints

3. Start the n8n Automation Tool

Run n8n locally:

npx n8n

The n8n interface will be available at:

http://localhost:5678

Import the workflow from:

/workflows/myworkflow.json

Execute the workflow to trigger the automation pipeline.

Running the Pipeline

There are two ways to run the pipeline.

Option 1 — Through n8n

Open the n8n editor

Execute the workflow

The workflow sends a POST request to the backend API

POST /run-pipeline
Option 2 — Run the Dataset Script

You can also run the entire dataset manually.

node scripts/runDataset.js

This script processes all demo and onboarding transcripts in the dataset folders.

Dataset Integration

To use the provided dataset, place transcripts in the following folders:

data/demo_calls
data/onboarding_calls

Example structure:

data
 ├── demo_calls
 │     ├── account1_demo.txt
 │     ├── account2_demo.txt
 │
 └── onboarding_calls
       ├── account1_onboarding.txt
       ├── account2_onboarding.txt

The pipeline automatically detects all files and processes them in batch.

Output Storage

Generated artifacts are stored in the following structure:

outputs/
   accounts/
      <account_id>/
         v1/
            account_memo.json
            agent_spec.json

         v2/
            account_memo.json
            agent_spec.json

Changelog files are stored in:

changelog/

Task tracking files are stored in:

tasks/
Idempotent Pipeline Behavior

The pipeline is designed to be repeatable and idempotent.

If onboarding data does not introduce new confirmed information, the system will not regenerate the v2 configuration.

Example log output:

No changes detected for account. Skipping update.

This prevents duplicate or conflicting configuration versions.

Known Limitations

This project intentionally uses rule-based extraction to satisfy the zero-cost constraint.

Limitations include:

Extraction logic relies on pattern matching rather than semantic understanding.

Complex conversational phrasing may not be fully captured.

Audio transcription is not implemented in this version; transcripts are assumed as input.

The dashboard provides basic monitoring but does not include advanced analytics.

These limitations were chosen to maintain a fully reproducible zero-cost solution.

Improvements With Production Access

With production infrastructure or paid APIs, the system could be significantly improved.

Potential improvements include:

LLM-Based Extraction

Using a local or hosted language model to extract structured information more reliably from transcripts.

This would improve:

emergency definition detection

routing rule extraction

constraint detection

Direct Retell API Integration

Instead of generating an agent specification JSON, the pipeline could directly create and update Retell agents through API calls.

Audio Transcription Support

The system could support direct audio ingestion using an open-source speech-to-text model such as Whisper.

Advanced Monitoring

A more advanced dashboard could include:

processing statistics

pipeline execution logs

diff visualization between v1 and v2 configurations

Production Storage

Outputs could be stored in a structured database such as Supabase or PostgreSQL instead of local JSON storage.

Repository Structure
clara-automation-pipeline

dashboard/
scripts/
workflows/
outputs/
data/
tasks/
changelog/

server.js
README.md
Summary

This project demonstrates a reproducible automation pipeline that transforms conversational inputs into structured agent configurations for Clara Answers.

The system focuses on:

safe automation

structured configuration generation

version-controlled updates

reproducible local execution

It simulates the operational onboarding pipeline required to deploy AI voice agents consistently across multiple service businesses.
