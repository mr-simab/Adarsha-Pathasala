const { requireSupabase } = require("../services/supabase");
const { profileFromDb } = require("../services/formatters");

exports.listTeachers = async (_req, res) => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, teacher_classes(class_id)")
    .eq("role", "teacher")
    .order("display_name");

  if (error) throw error;
  res.json(data.map((row) => ({
    ...profileFromDb(row),
    classIds: (row.teacher_classes || []).map((item) => item.class_id)
  })));
};

exports.createTeacher = async (req, res) => {
  const { email, password, displayName, classIds = [] } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Teacher name, email, and password are required." });
  }

  const supabase = requireSupabase();
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "teacher" }
  });

  if (userError) throw userError;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      auth_user_id: userData.user.id,
      role: "teacher",
      display_name: displayName
    })
    .select()
    .single();

  if (profileError) throw profileError;

  if (classIds.length) {
    const rows = classIds.map((classId) => ({ teacher_id: profile.id, class_id: classId }));
    const { error } = await supabase.from("teacher_classes").insert(rows);
    if (error) throw error;
  }

  res.status(201).json({ ...profileFromDb(profile), classIds });
};

exports.removeTeacher = async (req, res) => {
  const supabase = requireSupabase();
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.params.id)
    .eq("role", "teacher")
    .single();

  if (fetchError) throw fetchError;

  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(profile.auth_user_id);
  if (deleteUserError) throw deleteUserError;

  const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", req.params.id);
  if (deleteProfileError) throw deleteProfileError;

  res.json({ removed: true });
};
