import '../../domain/entities/coach_entities.dart';

/// Coach dashboard data model.
class CoachDashboardModel extends CoachDashboard {
  const CoachDashboardModel({
    required super.todayAttendanceCount,
    super.programs,
  });

  factory CoachDashboardModel.fromJson(Map<String, dynamic> json) {
    final programsList = (json['programs'] as List<dynamic>?)
            ?.map((p) => CoachProgramModel.fromJson(p as Map<String, dynamic>))
            .toList() ??
        [];

    return CoachDashboardModel(
      todayAttendanceCount: json['today_attendance_count'] as int? ?? 0,
      programs: programsList,
    );
  }
}

class CoachProgramModel extends CoachProgram {
  const CoachProgramModel({
    required super.id,
    required super.name,
    super.shortCode,
    super.activeMembersCount,
  });

  factory CoachProgramModel.fromJson(Map<String, dynamic> json) {
    return CoachProgramModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      shortCode: json['short_code'] as String?,
      activeMembersCount: json['active_members_count'] as int? ?? 0,
    );
  }
}

class CoachClassModel extends CoachClass {
  const CoachClassModel({
    required super.id,
    required super.programName,
    required super.startTime,
    required super.endTime,
  });

  factory CoachClassModel.fromJson(Map<String, dynamic> json) {
    return CoachClassModel(
      id: json['id'] as String,
      programName: json['program_name'] as String? ?? '',
      startTime: json['start_time'] as String? ?? '',
      endTime: json['end_time'] as String? ?? '',
    );
  }
}

class CoachAttendanceRecordModel extends CoachAttendanceRecord {
  const CoachAttendanceRecordModel({
    required super.id,
    super.memberName,
    super.memberNumber,
    super.programName,
    super.checkInTime,
    super.checkOutTime,
    super.durationMinutes,
    super.method,
  });

  factory CoachAttendanceRecordModel.fromJson(Map<String, dynamic> json) {
    final member = json['member'] as Map<String, dynamic>?;
    final program = json['program'] as Map<String, dynamic>?;

    return CoachAttendanceRecordModel(
      id: json['id'] as String,
      memberName: member?['full_name'] as String? ?? member?['name'] as String?,
      memberNumber: member?['member_number'] as String?,
      programName: program?['name'] as String?,
      checkInTime: json['check_in_time'] as String?,
      checkOutTime: json['check_out_time'] as String?,
      durationMinutes: json['duration_minutes'] as int?,
      method: json['method'] as String?,
    );
  }
}
