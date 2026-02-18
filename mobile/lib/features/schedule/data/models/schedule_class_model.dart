import '../../domain/entities/schedule_class.dart';

/// Schedule class data model with JSON deserialization.
class ScheduleClassModel extends ScheduleClass {
  const ScheduleClassModel({
    required super.id,
    required super.programName,
    super.programShortCode,
    required super.dayOfWeek,
    required super.startTime,
    required super.endTime,
    super.locationName,
  });

  factory ScheduleClassModel.fromJson(Map<String, dynamic> json) {
    final program = json['program'] as Map<String, dynamic>?;
    final location = json['location'] as Map<String, dynamic>?;

    return ScheduleClassModel(
      id: json['id'] as String,
      programName: program?['name'] as String? ?? '',
      programShortCode: program?['short_code'] as String?,
      dayOfWeek: json['day_of_week'] as String? ?? '',
      startTime: json['start_time'] as String? ?? '',
      endTime: json['end_time'] as String? ?? '',
      locationName: location?['name'] as String?,
    );
  }
}
