const { createClient } = require("@supabase/supabase-js");
const { env, hasSupabase, hasSupabaseAuth } = require("../config/env");

let serviceClient;
let authClient;

function getSupabase() {
  if (!hasSupabase()) return null;
  if (!serviceClient) {
    serviceClient = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serviceClient;
}

function getAuthClient() {
  if (!hasSupabaseAuth()) return null;
  if (!authClient) {
    authClient = createClient(env.supabase.url, env.supabase.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return authClient;
}

function requireSupabase() {
  const client = getSupabase();
  if (!client) {
    const error = new Error("Supabase is not configured. Fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.");
    error.status = 503;
    throw error;
  }
  return client;
}

module.exports = {
  getSupabase,
  getAuthClient,
  requireSupabase
};
