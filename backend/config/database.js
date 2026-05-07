const { env, hasSupabase } = require("./env");

module.exports = {
  supabaseUrl: env.supabase.url,
  supabaseAnonKey: env.supabase.anonKey,
  serviceRoleKey: env.supabase.serviceRoleKey,
  databaseUrl: env.supabase.databaseUrl,
  isConfigured: hasSupabase
};
