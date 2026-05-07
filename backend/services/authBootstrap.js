const { env } = require("../config/env");
const { getSupabase } = require("./supabase");

async function ensureAdminAccount() {
  if (!env.adminBootstrap.enabled) {
    return { skipped: true, message: "Admin bootstrap skipped." };
  }

  if (!env.adminBootstrap.email || !env.adminBootstrap.password) {
    return { skipped: true, message: "Admin bootstrap skipped because email or password is missing." };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return { skipped: true, message: "Admin bootstrap skipped because Supabase service role is not configured." };
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "admin")
    .maybeSingle();

  if (adminProfileError) throw adminProfileError;
  if (adminProfile) {
    return { skipped: false, message: "Admin account already exists." };
  }

  const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;

  let user = users.users.find((item) => item.email?.toLowerCase() === env.adminBootstrap.email.toLowerCase());
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: env.adminBootstrap.email,
      password: env.adminBootstrap.password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        institution: env.appName
      }
    });

    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    auth_user_id: user.id,
    role: "admin",
    display_name: "Administrator"
  });

  if (profileError) throw profileError;
  return { skipped: false, message: "Admin account created in Supabase Auth." };
}

module.exports = { ensureAdminAccount };
