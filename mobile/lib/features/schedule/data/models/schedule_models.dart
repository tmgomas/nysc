import '../../domain/entities/program_class_slot.dart';

class ProgramClassSlotModel extends ProgramClassSlot {
  const ProgramClassSlotModel({
    required super.id,
    super.programClassId,
    required super.date,
    super.dayOfWeek,
    super.startTime,
    super.endTime,
    super.formattedTime,
    super.programName,
    super.programShortCode,
    super.label,
    super.coach,
    super.location,
    super.status,
    super.cancellationReason,
    super.isHoliday,
    super.holidayName,
  });

  factory ProgramClassSlotModel.fromJson(Map<String, dynamic> json) {
    return ProgramClassSlotModel(
      id: json['id'] as String,
      programClassId: json['program_class_id'] as String?,
      date: json['date'] as String,
      dayOfWeek: json['day_of_week'] as String?,
      startTime: json['start_time'] as String?,
      endTime: json['end_time'] as String?,
      formattedTime: json['formatted_time'] as String?,
      programName: json['program_name'] as String?,
      programShortCode: json['program_short_code'] as String?,
      label: json['label'] as String?,
      coach: json['coach'] as String?,
      location: json['location'] as String?,
      status: json['status'] as String? ?? 'scheduled',
      cancellationReason: json['cancellation_reason'] as String?,
      isHoliday: json['is_holiday'] as bool? ?? false,
      holidayName: json['holiday_name'] as String?,
    );
  }
}

/// A day group (date + list of classes) parsed from the API.
class ScheduleDayModel {
  final String date;
  final List<ProgramClassSlotModel> classes;

  ScheduleDayModel({required this.date, required this.classes});

  factory ScheduleDayModel.fromJson(Map<String, dynamic> json) {
    final classList = (json['classes'] as List<dynamic>? ?? [])
        .map((c) => ProgramClassSlotModel.fromJson(c as Map<String, dynamic>))
        .toList();
    return ScheduleDayModel(
      date: json['date'] as String,
      classes: classList,
    );
  }
}

/// Top-level schedule response.
class ScheduleResponseModel {
  final int totalUpcoming;
  final int totalScheduled;
  final Map<String, dynamic>? nextClass;
  final List<ScheduleDayModel> upcomingClasses;

  ScheduleResponseModel({
    required this.totalUpcoming,
    required this.totalScheduled,
    this.nextClass,
    required this.upcomingClasses,
  });

  factory ScheduleResponseModel.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>? ?? {};
    final daysList = (json['upcoming_classes'] as List<dynamic>? ?? [])
        .map((d) => ScheduleDayModel.fromJson(d as Map<String, dynamic>))
        .toList();

    return ScheduleResponseModel(
      totalUpcoming: summary['total_upcoming'] as int? ?? 0,
      totalScheduled: summary['total_upcoming_scheduled'] as int? ?? 0,
      nextClass: summary['next_class'] as Map<String, dynamic>?,
      upcomingClasses: daysList,
    );
  }
}
