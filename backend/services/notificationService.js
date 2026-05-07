const { requireSupabase } = require("./supabase");
const { sendWebPush } = require("./firebaseMessaging");
const { notificationFromDb } = require("./formatters");

async function recordNotification({ studentId, type, message, fcmStatus = "queued", fcmMessageId = null, errorMessage = null }) {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      student_id: studentId || null,
      type,
      message,
      fcm_status: fcmStatus,
      fcm_message_id: fcmMessageId,
      error_message: errorMessage
    })
    .select()
    .single();

  if (error) throw error;
  return notificationFromDb(data);
}

async function sendToStudent({ studentId, type, message }) {
  const supabase = requireSupabase();
  const { data: tokenRows, error: tokenError } = await supabase
    .from("device_tokens")
    .select("token")
    .eq("student_id", studentId);

  if (tokenError) throw tokenError;

  const tokens = (tokenRows || []).map((row) => row.token).filter(Boolean);

  if (tokens.length === 0) {
    return recordNotification({
      studentId,
      type,
      message,
      fcmStatus: "no_token"
    });
  }

  try {
    const response = await sendWebPush({
      tokens,
      title: type,
      body: message
    });

    if (!response.configured) {
      return recordNotification({ studentId, type, message, fcmStatus: "queued" });
    }

    return recordNotification({
      studentId,
      type,
      message,
      fcmStatus: response.failureCount > 0 ? "partial" : "sent",
      fcmMessageId: `${response.successCount}/${tokens.length}`
    });
  } catch (error) {
    return recordNotification({
      studentId,
      type,
      message,
      fcmStatus: "failed",
      errorMessage: error.message
    });
  }
}

module.exports = {
  recordNotification,
  sendToStudent
};
