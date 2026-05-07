const { env } = require("../config/env");
const { getAuthClient, requireSupabase } = require("../services/supabase");
const { profileFromDb } = require("../services/formatters");

async function loadProfile(authUserId) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw error;
  return data ? profileFromDb(data) : null;
}

async function requireUser(req, res, next) {
  try {
    if (!env.requireAuth) {
      req.user = {
        id: "development-admin",
        authUserId: "development-admin",
        role: "admin",
        displayName: "Development Admin"
      };
      return next();
    }

    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) {
      return res.status(401).json({ error: "Authentication is required." });
    }

    const supabaseAuth = getAuthClient();
    if (!supabaseAuth) {
      return res.status(503).json({ error: "Supabase Auth is not configured." });
    }

    const { data, error } = await supabaseAuth.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Session is invalid or expired." });
    }

    const profile = await loadProfile(data.user.id);
    if (!profile || !["admin", "teacher", "parent"].includes(profile.role)) {
      return res.status(403).json({ error: "This account does not have an application role." });
    }

    req.user = profile;
    return next();
  } catch (error) {
    return next(error);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    }
    return next();
  };
}

module.exports = {
  requireUser,
  requireRole,
  loadProfile
};
