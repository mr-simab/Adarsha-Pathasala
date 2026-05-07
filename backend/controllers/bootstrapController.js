const crypto = require("crypto");
const { requireSupabase } = require("../services/supabase");
const {
  profileFromDb,
  classFromDb,
  studentFromDb,
  feeFromDb,
  noteFromDb,
  attendanceFromDb,
  notificationFromDb
} = require("../services/formatters");
const { ensureFeeRecordsForStudents } = require("../services/feeCycle");
const { assignedClassIds } = require("../services/permissions");

function etagFor(payload) {
  return `"${crypto.createHash("sha1").update(JSON.stringify(payload)).digest("hex")}"`;
}

async function getParentStudent(supabase, user) {
  const { data, error } = await supabase
    .from("students")
    .select("*, school_classes(name, monthly_fee)")
    .eq("parent_user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

exports.getBootstrap = async (req, res) => {
  const supabase = requireSupabase();
  const role = req.user.role;
  const payload = {
    role,
    user: req.user,
    classes: [],
    teachers: [],
    students: [],
    attendance: [],
    fees: [],
    notes: [],
    notifications: []
  };

  if (role === "admin") {
    const [classes, teachers, students] = await Promise.all([
      supabase.from("school_classes").select("*").eq("active", true).order("name"),
      supabase.from("profiles").select("*, teacher_classes(class_id)").eq("role", "teacher").order("display_name"),
      supabase.from("students").select("*, school_classes(name, monthly_fee)").eq("active", true).order("full_name")
    ]);

    const error = [classes, teachers, students].find((result) => result.error)?.error;
    if (error) throw error;

    await ensureFeeRecordsForStudents(students.data);
    const { data: fees, error: feeError } = await supabase.from("fee_records").select("*").order("cycle_start", { ascending: false });
    if (feeError) throw feeError;

    payload.classes = classes.data.map(classFromDb);
    payload.teachers = teachers.data.map((row) => ({
      ...profileFromDb(row),
      classIds: (row.teacher_classes || []).map((item) => item.class_id)
    }));
    payload.students = students.data.map(studentFromDb);
    payload.fees = fees.map(feeFromDb);
  }

  if (role === "teacher") {
    const classIds = await assignedClassIds(req.user);
    if (classIds.length) {
      const [classes, students, notes, attendance] = await Promise.all([
        supabase.from("school_classes").select("*").in("id", classIds).eq("active", true).order("name"),
        supabase.from("students").select("*, school_classes(name, monthly_fee)").in("class_id", classIds).eq("active", true).order("full_name"),
        supabase.from("notes").select("*, school_classes(name)").in("class_id", classIds).order("created_at", { ascending: false }),
        supabase.from("attendance_logs").select("*").in("class_id", classIds).order("created_at", { ascending: false }).limit(200)
      ]);

      const error = [classes, students, notes, attendance].find((result) => result.error)?.error;
      if (error) throw error;

      payload.classes = classes.data.map(classFromDb);
      payload.students = students.data.map(studentFromDb);
      payload.notes = notes.data.map(noteFromDb);
      payload.attendance = attendance.data.map(attendanceFromDb);
    }
  }

  if (role === "parent") {
    const student = await getParentStudent(supabase, req.user);
    if (student) {
      await ensureFeeRecordsForStudents([student]);
      const [notes, notifications, fees] = await Promise.all([
        supabase.from("notes").select("*, school_classes(name)").eq("class_id", student.class_id).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("student_id", student.id).order("created_at", { ascending: false }).limit(200),
        supabase.from("fee_records").select("*").eq("student_id", student.id).order("cycle_start", { ascending: false })
      ]);

      const error = [notes, notifications, fees].find((result) => result.error)?.error;
      if (error) throw error;

      payload.students = [studentFromDb(student)];
      payload.notes = notes.data.map(noteFromDb);
      payload.notifications = notifications.data.map(notificationFromDb);
      payload.fees = fees.data.map(feeFromDb);
    }
  }

  const etag = etagFor(payload);
  if (req.headers["if-none-match"] === etag) {
    return res.status(304).end();
  }

  res.set("ETag", etag);
  res.json(payload);
};
