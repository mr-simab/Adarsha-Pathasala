const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function booleanFromEnv(value, fallback = false) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function cleanPrivateKey(value) {
  return (value || "").replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

function firstEnv(...names) {
  for (const name of names) {
    if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  }
  return "";
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  appName: process.env.APP_NAME || "Adarsha Pathasala Data Management System",
  appOrigin: process.env.APP_ORIGIN || "http://localhost:3000",
  requireAuth: booleanFromEnv(process.env.REQUIRE_AUTH, false),
  adminBootstrap: {
    enabled: booleanFromEnv(process.env.AUTO_CREATE_ADMIN, false),
    email: process.env.BOOTSTRAP_ADMIN_EMAIL || "",
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD || ""
  },
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    databaseUrl: process.env.SUPABASE_DB_URL || "",
    ssl: booleanFromEnv(process.env.SUPABASE_DB_SSL, true),
    autoRunMigrations: booleanFromEnv(process.env.AUTO_RUN_MIGRATIONS, false)
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    publicConfig: {
      apiKey: firstEnv("PUBLIC_FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY"),
      authDomain: firstEnv("PUBLIC_FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_AUTH_DOMAIN"),
      projectId: firstEnv("PUBLIC_FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID", "FIREBASE_PROJECT_ID"),
      storageBucket: firstEnv("PUBLIC_FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_STORAGE_BUCKET"),
      messagingSenderId: firstEnv("PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_MESSAGING_SENDER_ID"),
      appId: firstEnv("PUBLIC_FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID")
    },
    vapidKey: firstEnv("PUBLIC_FIREBASE_VAPID_KEY", "VITE_FIREBASE_VAPID_KEY")
  }
};

function hasSupabase() {
  return Boolean(env.supabase.url && env.supabase.serviceRoleKey);
}

function hasSupabaseAuth() {
  return Boolean(env.supabase.url && env.supabase.anonKey);
}

function hasFirebaseAdmin() {
  return Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey);
}

function publicRuntimeConfig() {
  return {
    appName: env.appName,
    authRequired: env.requireAuth,
    timestamp: new Date().toISOString(),
    services: {
      supabaseConfigured: hasSupabase(),
      firebaseConfigured: hasFirebaseAdmin()
    },
    firebase: {
      config: env.firebase.publicConfig,
      vapidKey: env.firebase.vapidKey,
      enabled: Boolean(
        env.firebase.publicConfig.apiKey &&
        env.firebase.publicConfig.projectId &&
        env.firebase.publicConfig.messagingSenderId &&
        env.firebase.publicConfig.appId &&
        env.firebase.vapidKey
      )
    }
  };
}

module.exports = {
  env,
  hasSupabase,
  hasSupabaseAuth,
  hasFirebaseAdmin,
  publicRuntimeConfig
};
