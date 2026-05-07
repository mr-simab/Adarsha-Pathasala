const { requireSupabase } = require("../services/supabase");

exports.registerToken = async (req, res) => {
  const { studentId, token, platform = "web" } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Device token is required." });
  }

  const supabase = requireSupabase();
  let scopedStudentId = studentId;

  if (req.user.role === "teacher") {
    return res.status(403).json({ error: "Teachers cannot register parent devices." });
  }

  if (req.user.role === "parent") {
    const { data: student, error } = await supabase
      .from("students")
      .select("id")
      .eq("parent_user_id", req.user.id)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    scopedStudentId = student?.id;
  }

  if (!scopedStudentId) {
    return res.status(400).json({ error: "Student is required for device registration." });
  }

  const { data, error } = await supabase
    .from("device_tokens")
    .upsert({
      student_id: scopedStudentId,
      token,
      platform,
      last_seen_at: new Date().toISOString()
    }, { onConflict: "token" })
    .select()
    .single();

  if (error) throw error;
  res.status(201).json({ registered: true, id: data.id });
};
