const path = require("path");
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const attendanceRoutes = require("./routes/attendance");
const authRoutes = require("./routes/auth");
const bootstrapRoutes = require("./routes/bootstrap");
const configRoutes = require("./routes/config");
const deviceTokenRoutes = require("./routes/deviceTokens");
const feeRoutes = require("./routes/fees");
const noteRoutes = require("./routes/notes");
const notificationRoutes = require("./routes/notifications");
const studentRoutes = require("./routes/students");
const { env, hasFirebaseAdmin, hasSupabase } = require("./config/env");
const { requireUser, requireRole } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");
const { ensureAdminAccount } = require("./services/authBootstrap");
const { runMigrations } = require("./services/migrations");

const app = express();
const port = env.port;
const publicDir = path.join(__dirname, "..", "frontend", "dist");
const startupWarnings = [];

app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://www.gstatic.com"],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://*.googleapis.com",
        "https://firebaseinstallations.googleapis.com",
        "https://fcmregistrations.googleapis.com"
      ],
      frameSrc: ["'self'", "https://drive.google.com", "https://docs.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'"],
      workerSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  }
}));
app.use(cors({ origin: env.appOrigin === "*" ? true : [env.appOrigin, "http://localhost:3000"] }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/api", rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(publicDir));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "adarsha-pathasala",
    supabase: hasSupabase() ? "configured" : "missing",
    firebase: hasFirebaseAdmin() ? "configured" : "missing",
    startupWarnings
  });
});

app.use("/api/config", configRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bootstrap", requireUser, bootstrapRoutes);
app.use("/api/device-tokens", requireUser, deviceTokenRoutes);
app.use("/api/students", requireUser, studentRoutes);
app.use("/api/classes", requireUser, requireRole("admin"), require("./routes/classes"));
app.use("/api/users", requireUser, requireRole("admin"), require("./routes/users"));
app.use("/api/attendance", requireUser, attendanceRoutes);
app.use("/api/fees", requireUser, feeRoutes);
app.use("/api/notes", requireUser, noteRoutes);
app.use("/api/notifications", requireUser, notificationRoutes);

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(errorHandler);

async function runStartupTask(name, task) {
  try {
    const result = await task();
    if (result && !result.skipped) console.log(result.message);
  } catch (error) {
    const message = `${name} failed: ${error.message}`;
    startupWarnings.push(message);
    console.warn(message);
  }
}

async function startServer() {
  await runStartupTask("Database migration", () => runMigrations());
  await runStartupTask("Admin bootstrap", () => ensureAdminAccount());

  app.listen(port, () => {
    console.log(`Adarsha Pathasala Data Management System running at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Unexpected startup failure: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
