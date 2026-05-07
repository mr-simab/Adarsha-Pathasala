const { requireSupabase } = require("./supabase");

async function assignedClassIds(user) {
  if (user.role === "admin") return null;
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("teacher_classes")
    .select("class_id")
    .eq("teacher_id", user.id);

  if (error) throw error;
  return data.map((row) => row.class_id);
}

async function assertTeacherClassAccess(user, classId) {
  if (user.role === "admin") return;
  if (user.role !== "teacher") {
    const error = new Error("This role cannot access class operations.");
    error.status = 403;
    throw error;
  }

  const ids = await assignedClassIds(user);
  if (!ids.includes(classId)) {
    const error = new Error("Teacher is not assigned to this class.");
    error.status = 403;
    throw error;
  }
}

module.exports = {
  assignedClassIds,
  assertTeacherClassAccess
};
