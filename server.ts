import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const db = new Database("drivewaydash.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL,
    price INTEGER NOT NULL,
    type TEXT NOT NULL,
    isHighPriority INTEGER NOT NULL,
    postedAt TEXT NOT NULL,
    postedBy TEXT NOT NULL,
    status TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM jobs ORDER BY postedAt DESC").all();
    // Convert isHighPriority back to boolean
    const formattedJobs = jobs.map((job: any) => ({
      ...job,
      isHighPriority: !!job.isHighPriority
    }));
    res.json(formattedJobs);
  });

  app.post("/api/jobs", (req, res) => {
    const { id, title, description, city, price, type, isHighPriority, postedAt, postedBy, status } = req.body;
    try {
      db.prepare(`
        INSERT INTO jobs (id, title, description, city, price, type, isHighPriority, postedAt, postedBy, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, city, price, type, isHighPriority ? 1 : 0, postedAt, postedBy, status);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      db.prepare("UPDATE jobs SET status = ? WHERE id = ?").run(status, id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
