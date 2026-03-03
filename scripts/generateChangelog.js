// scripts/generateChangelog.js

const fs = require("fs");
const path = require("path");

function generateChangelog(accountId, changes) {
  if (!changes.length) return;

  const changelogPath = path.join(
    __dirname,
    "..",
    "changelog",
    `${accountId}_changes.md`
  );

  let content = `# Changes for ${accountId}\n\n`;
  content += `## v1 → v2 Updates\n\n`;

  changes.forEach(change => {
    if (change.conflict) {
  content += `- ⚠ **${change.field}** changed from "${change.old}" → "${change.new}" (CONFLICT)\n`;
} else {
  content += `- **${change.field}** updated\n`;
}
  });

  fs.writeFileSync(changelogPath, content);
  console.log(`📝 Changelog created for ${accountId}`);
}

module.exports = { generateChangelog };