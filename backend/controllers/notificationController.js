const { sendToStudent } = require("../services/notificationService");
const { requireSupabase } = require("../services/supabase");
const { notificationFromDb } = require("../services/formatters");

exports.listNotifications = async (req, res) => {
  const supabase = requireSupabase();
  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (req.user.role === "parent") {
    const { data: students, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("parent_user_id", req.user.id)
      .eq("active", true);
    if (studentError) throw studentError;

    const studentIds = (students || []).map((student) => student.id);
    if (!studentIds.length) return res.json([]);
    query = query.in("student_id", studentIds);
  }

  if (req.user.role === "teacher") {
    const error = new Error("Teachers cannot list parent notifications.");
    error.status = 403;
    throw error;
  }

  const { data, error } = await query;
  if (error) throw error;
  return res.json((data || []).map(notificationFromDb));
};

exports.sendNotification = async (req, res) => {
  const { targetStudent, type, message } = req.body;
  if (!targetStudent || !type || !message) {
    return res.status(400).json({ error: "Student, notification type, and message are required." });
  }

  const notification = await sendToStudent({
    studentId: targetStudent,
    type,
    message
  });

  return res.status(202).json(notification);
};
