const { requireSupabase } = require("../services/supabase");
const { noteFromDb } = require("../services/formatters");
const { assignedClassIds, assertTeacherClassAccess } = require("../services/permissions");

exports.listNotes = async (req, res) => {
  const supabase = requireSupabase();
  let query = supabase
    .from("notes")
    .select("*, school_classes(name)")
    .order("created_at", { ascending: false });

  if (req.user.role === "teacher") {
    const classIds = await assignedClassIds(req.user);
    if (!classIds.length) return res.json([]);
    query = query.in("class_id", classIds);
  }

  if (req.user.role === "parent") {
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("class_id")
      .eq("parent_user_id", req.user.id)
      .eq("active", true);
    if (studentError) throw studentError;

    const classIds = [...new Set((students || []).map((student) => student.class_id).filter(Boolean))];
    if (!classIds.length) return res.json([]);
    query = query.in("class_id", classIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return res.json((data || []).map(noteFromDb));
};

exports.saveNote = async (req, res) => {
  if (!["admin", "teacher"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only Admin and Teacher can upload notes." });
  }

  const { title, subject, classId, driveUrl } = req.body;
  if (!title || !subject || !classId || !driveUrl) {
    return res.status(400).json({ error: "Title, subject, class, and Google Drive link are required." });
  }

  // Validate and convert Google Drive URL
  let processedUrl = driveUrl.trim();
  if (!processedUrl.includes('drive.google.com')) {
    return res.status(400).json({ error: "Invalid Google Drive link." });
  }
  if (processedUrl.includes('/view') || processedUrl.includes('/edit')) {
    processedUrl = processedUrl.replace('/view', '/preview').replace('/edit', '/preview');
  } else if (!processedUrl.includes('/preview')) {
    processedUrl = processedUrl.replace('/file/d/', '/file/d/').replace('/open?id=', '/preview?id=');
  }

  await assertTeacherClassAccess(req.user, classId);

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      title,
      subject,
      class_id: classId,
      drive_url: processedUrl,
      uploaded_by: req.user.id
    })
    .select("*, school_classes(name)")
    .single();

  if (error) throw error;
  return res.status(201).json(noteFromDb(data));
};
