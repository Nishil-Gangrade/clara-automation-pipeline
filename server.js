const express = require("express");
const { runPipeline } = require("./scripts/runPipeline");

const app = express();
app.use(express.json());

app.post("/run-pipeline", async (req, res) => {
  try {
    await runPipeline();
    res.json({ status: "Pipeline executed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Pipeline failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Clara Automation Pipeline API Running");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});