const { requireSupabase } = require("../services/supabase");
const { studentFromDb } = require("../services/formatters");
const { ensureFeeRecordsForStudents } = require("../services/feeCycle");
const { assignedClassIds } = require("../services/permissions");

async function selectStudentsForUser(user) {
  const supabase = requireSupabase();
  let query = supabase
    .from("students")
    .select("*, school_classes(name, monthly_fee)")
    .eq("active", true)
    .order("full_name");

  if (user.role === "teacher") {
    const classIds = await assignedClassIds(user);
    query = classIds.length ? query.in("class_id", classIds) : query.eq("class_id", "00000000-0000-0000-0000-000000000000");
  }

  if (user.role === "parent") {
    query = query.eq("parent_user_id", user.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

exports.listStudents = async (req, res) => {
  const rows = await selectStudentsForUser(req.user);
  await ensureFeeRecordsForStudents(rows);
  res.json(rows.map(studentFromDb));
};

exports.createStudent = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only Admin can add students." });
  }

  const { name, classId, parentPhone, enrollmentDate, parentPassword } = req.body;
  if (!name || !classId || !parentPhone || !enrollmentDate) {
    return res.status(400).json({ error: "Student name, class, parent phone, and enrollment date are required." });
  }

  const supabase = requireSupabase();
  let parentProfileId = null;

  if (parentPassword) {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      phone: parentPhone,
      password: parentPassword,
      phone_confirm: true,
      user_metadata: { role: "parent" }
    });
    if (userError) throw userError;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        auth_user_id: userData.user.id,
        role: "parent",
        display_name: `${name} Parent`,
        phone: parentPhone
      })
      .select()
      .single();
    if (profileError) throw profileError;
    parentProfileId = profile.id;
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      class_id: classId,
      parent_user_id: parentProfileId,
      full_name: name,
      parent_phone: parentPhone,
      enrollment_date: enrollmentDate
    })
    .select("*, school_classes(name, monthly_fee)")
    .single();

  if (error) throw error;
  await ensureFeeRecordsForStudents([data]);
  res.status(201).json(studentFromDb(data));
};

exports.removeStudent = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only Admin can remove students." });
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("students")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select("*, school_classes(name, monthly_fee)")
    .single();

  if (error) throw error;
  res.json(studentFromDb(data));
};
