const { env } = require("../config/env");
const { getAuthClient } = require("../services/supabase");
const { loadProfile } = require("../middleware/auth");

exports.login = async (req, res) => {
  const { identifier, email, password } = req.body;
  const login = identifier || email;
  if (!login || !password) {
    return res.status(400).json({ error: "Login ID and password are required." });
  }

  const supabase = getAuthClient();
  if (!supabase) {
    return res.status(503).json({ error: "Supabase Auth is not configured." });
  }

  const credentials = login.includes("@")
    ? { email: login, password }
    : { phone: login, password };
  const { data, error } = await supabase.auth.signInWithPassword(credentials);
  if (error) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const profile = await loadProfile(data.user.id);
  if (!profile) {
    return res.status(403).json({ error: "This account is not active in the application." });
  }

  res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at,
    user: {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      role: profile.role,
      profileId: profile.id,
      displayName: profile.displayName
    },
    appName: env.appName
  });
};

exports.me = async (req, res) => {
  res.json({
    user: req.user || null,
    authRequired: env.requireAuth
  });
};
