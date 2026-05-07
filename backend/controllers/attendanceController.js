const { requireSupabase } = require("../services/supabase");
const { attendanceFromDb } = require("../services/formatters");
const { sendToStudent } = require("../services/notificationService");
const { assertTeacherClassAccess } = require("../services/permissions");

exports.saveAttendance = async (req, res) => {
  if (!["admin", "teacher"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only Admin and Teacher can take attendance." });
  }

  const { classId, session, date, entries } = req.body;
  if (!classId || !session || !date || !Array.isArray(entries)) {
    return res.status(400).json({ error: "Class, session, date, and attendance entries are required." });
  }

  await assertTeacherClassAccess(req.user, classId);

  const supabase = requireSupabase();
  const rows = entries.map((entry) => ({
    student_id: entry.studentId,
    class_id: classId,
    attendance_date: date,
    session,
    status: entry.status,
    marked_by: req.user.id
  }));

  const { data, error } = await supabase
    .from("attendance_logs")
    .upsert(rows, { onConflict: "student_id,attendance_date,session" })
    .select();

  if (error) throw error;

  const notifications = await Promise.all(entries.map((entry) =>
    sendToStudent({
      studentId: entry.studentId,
      type: "Attendance Alert",
      message: `${entry.studentName || "Student"} is ${entry.status} - ${session} Session`
    })
  ));

  return res.status(201).json({
    saved: data.length,
    attendance: data.map(attendanceFromDb),
    notifications
  });
};
