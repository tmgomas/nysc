import '../../domain/entities/attendance_record.dart';

/// Attendance record data model with JSON deserialization.
class AttendanceRecordModel extends AttendanceRecord {
  const AttendanceRecordModel({
    required super.id,
    super.checkInTime,
    super.checkOutTime,
    super.durationMinutes,
    super.method,
    super.notes,
    super.programName,
  });

  factory AttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    return AttendanceRecordModel(
      id: json['id'] as String,
      checkInTime: json['check_in_time'] as String?,
      checkOutTime: json['check_out_time'] as String?,
      durationMinutes: json['duration_minutes'] as int?,
      method: json['method'] as String?,
      notes: json['notes'] as String?,
      programName: (json['program'] as Map<String, dynamic>?)?['name'] as String?,
    );
  }
}
