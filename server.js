const express = require("express");
const fs = require("fs");
const path = require("path");

const { runPipeline } = require("./scripts/runPipeline");

const app = express();

app.use(express.json());


app.use(express.static(path.join(__dirname, "dashboard")));


app.post("/run-pipeline", async (req, res) => {

  try {

    console.log(" Pipeline execution triggered");

    await runPipeline();

    res.json({
      status: "Pipeline executed successfully"
    });

  } catch (error) {

    console.error("Pipeline failed");
    console.error(error.message);

    res.status(500).json({
      error: "Pipeline failed"
    });

  }

});


app.get("/accounts", (req, res) => {

  try {

    const accountsDir = path.join(__dirname, "outputs", "accounts");

    if (!fs.existsSync(accountsDir)) {
      return res.json([]);
    }

    const accounts = fs.readdirSync(accountsDir);

    const results = accounts.map(account => {

      const v1Path = path.join(
        accountsDir,
        account,
        "v1",
        "account_memo.json"
      );

      const v2Path = path.join(
        accountsDir,
        account,
        "v2",
        "account_memo.json"
      );

      const v1Exists = fs.existsSync(v1Path);
      const v2Exists = fs.existsSync(v2Path);

      let lastUpdated = null;

      try {

        const stats = fs.statSync(
          path.join(accountsDir, account)
        );

        lastUpdated = stats.mtime;

      } catch {
        lastUpdated = null;
      }

      return {
        account_id: account,
        v1_generated: v1Exists,
        v2_generated: v2Exists,
        last_updated: lastUpdated
      };

    });

    res.json(results);

  } catch (error) {

    console.error("Failed to load accounts");

    res.status(500).json({
      error: "Failed to load accounts"
    });

  }

});



app.get("/health", (req, res) => {

  res.json({
    status: "Clara Automation Pipeline Running"
  });

});


const PORT = 3000;

app.listen(PORT, () => {

  console.log("===================================");
  console.log("Clara Automation Pipeline Server");
  console.log(`Running at: http://localhost:${PORT}`);
  console.log("Dashboard available at root URL");
  console.log("===================================");

});