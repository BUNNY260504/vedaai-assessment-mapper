import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import examRouter from "./routes/exam.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/exams", examRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(path.join(clientDist, "index.html"))) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (req, res) =>
    res.send("VedaAI API running. Client not built yet (run client dev server separately).")
  );
}

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`VedaAI server listening on http://localhost:${port}`);
});
