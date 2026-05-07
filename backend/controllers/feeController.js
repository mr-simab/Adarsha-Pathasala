const { requireSupabase } = require("../services/supabase");
const { feeFromDb } = require("../services/formatters");
const { sendToStudent } = require("../services/notificationService");

exports.markFeePaid = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Only Admin can mark fees as paid." });
  }

  const { studentId, cycleStart } = req.body;
  if (!studentId || !cycleStart) {
    return res.status(400).json({ error: "Student and fee cycle are required." });
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("fee_records")
    .update({
      status: "Paid",
      marked_paid_by: req.user.id,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("student_id", studentId)
    .eq("cycle_start", cycleStart)
    .select()
    .single();

  if (error) throw error;

  const notification = await sendToStudent({
    studentId,
    type: "Payment Success",
    message: "Monthly fee payment has been marked as paid."
  });

  return res.json({ fee: feeFromDb(data), notification });
};
