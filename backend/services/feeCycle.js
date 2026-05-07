const { requireSupabase } = require("./supabase");

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function currentCycleStart(enrollmentDate, referenceDate = new Date()) {
  const enrolled = new Date(`${enrollmentDate}T00:00:00`);
  const ref = new Date(referenceDate);
  let year = ref.getFullYear();
  let month = ref.getMonth();
  const day = enrolled.getDate();

  if (ref.getDate() < day) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  const validDay = Math.min(day, daysInMonth(year, month));
  return isoDate(new Date(year, month, validDay));
}

async function ensureFeeRecordsForStudents(students) {
  if (!students.length) return [];

  const supabase = requireSupabase();
  const rows = students.map((student) => ({
    student_id: student.id,
    cycle_start: currentCycleStart(student.enrollment_date || student.enrollmentDate),
    amount: Number(student.school_classes?.monthly_fee || student.monthlyFee || 0),
    status: "Unpaid"
  }));

  const { error } = await supabase
    .from("fee_records")
    .upsert(rows, { onConflict: "student_id,cycle_start", ignoreDuplicates: true });

  if (error) throw error;

  return rows;
}

module.exports = {
  currentCycleStart,
  ensureFeeRecordsForStudents
};
