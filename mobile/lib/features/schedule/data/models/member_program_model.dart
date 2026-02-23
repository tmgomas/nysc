import '../../domain/entities/member_program.dart';

class PracticeDayModel extends PracticeDay {
  const PracticeDayModel({
    required super.day,
    super.startTime,
    super.endTime,
    super.formattedTime,
  });

  factory PracticeDayModel.fromJson(Map<String, dynamic> json) {
    return PracticeDayModel(
      day: json['day'] as String,
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      formattedTime: json['formatted_time'] as String?,
    );
  }
}

class AssignedClassModel extends AssignedClass {
  const AssignedClassModel({
    required super.id,
    super.label,
    super.dayOfWeek,
    super.formattedTime,
    super.coach,
  });

  factory AssignedClassModel.fromJson(Map<String, dynamic> json) {
    return AssignedClassModel(
      id: json['id'] as String,
      label: json['label'] as String?,
      dayOfWeek: json['day_of_week'] as String?,
      formattedTime: json['formatted_time'] as String?,
      coach: json['coach'] as String?,
    );
  }
}

class MemberProgramModel extends MemberProgram {
  const MemberProgramModel({
    required super.id,
    super.name,
    super.shortCode,
    super.monthlyFee,
    super.location,
    super.enrolledAt,
    super.status,
    super.scheduleType,
    super.practiceDays,
    super.assignedClasses,
  });

  factory MemberProgramModel.fromJson(Map<String, dynamic> json) {
    final scheduleType = json['schedule_type'] as String? ?? 'practice_days';

    final practiceDaysList = (json['practice_days'] as List<dynamic>? ?? [])
        .map((d) => PracticeDayModel.fromJson(d as Map<String, dynamic>))
        .toList();

    final assignedClassList = (json['assigned_classes'] as List<dynamic>? ?? [])
        .map((c) => AssignedClassModel.fromJson(c as Map<String, dynamic>))
        .toList();

    return MemberProgramModel(
      id: json['id'] as String,
      name: json['name'] as String?,
      shortCode: json['short_code'] as String?,
      monthlyFee: json['monthly_fee']?.toString(),
      location: json['location'] as String?,
      enrolledAt: json['enrolled_at'] as String?,
      status: json['status'] as String?,
      scheduleType: scheduleType,
      practiceDays: practiceDaysList,
      assignedClasses: assignedClassList,
    );
  }
}
