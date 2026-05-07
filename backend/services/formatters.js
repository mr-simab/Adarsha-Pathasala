function profileFromDb(row) {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    role: row.role,
    displayName: row.display_name,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function classFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    monthlyFee: Number(row.monthly_fee || 0),
    active: row.active,
    updatedAt: row.updated_at
  };
}

function studentFromDb(row) {
  return {
    id: row.id,
    classId: row.class_id,
    parentUserId: row.parent_user_id,
    name: row.full_name,
    parentPhone: row.parent_phone,
    enrollmentDate: row.enrollment_date,
    active: row.active,
    className: row.school_classes?.name || row.class_name || "",
    monthlyFee: Number(row.school_classes?.monthly_fee || 0),
    updatedAt: row.updated_at
  };
}

function feeFromDb(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    cycleStart: row.cycle_start,
    amount: Number(row.amount || 0),
    status: row.status,
    paidAt: row.paid_at,
    updatedAt: row.updated_at
  };
}

function noteFromDb(row) {
  return {
    id: row.id,
    classId: row.class_id,
    className: row.school_classes?.name || "",
    title: row.title,
    subject: row.subject,
    driveUrl: row.drive_url,
    createdAt: row.created_at
  };
}

function attendanceFromDb(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    classId: row.class_id,
    date: row.attendance_date,
    session: row.session,
    status: row.status,
    createdAt: row.created_at
  };
}

function notificationFromDb(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    type: row.type,
    message: row.message,
    fcmStatus: row.fcm_status,
    fcmMessageId: row.fcm_message_id,
    errorMessage: row.error_message,
    createdAt: row.created_at
  };
}

module.exports = {
  profileFromDb,
  classFromDb,
  studentFromDb,
  feeFromDb,
  noteFromDb,
  attendanceFromDb,
  notificationFromDb
};
