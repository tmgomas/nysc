import '../../domain/entities/assigned_class.dart';

class AssignedClassModel extends AssignedClass {
  const AssignedClassModel({
    required super.assignmentId,
    required super.programClassId,
    required super.programName,
    required super.dayOfWeek,
    required super.startTime,
    required super.endTime,
    super.label,
    super.coachName,
    super.formattedTime,
    super.availableSpots,
    super.isFull,
    super.upcomingDates = const [],
  });

  factory AssignedClassModel.fromJson(Map<String, dynamic> json) {
    return AssignedClassModel(
      assignmentId:    json['assignment_id'] as String? ?? json['id'] as String? ?? '',
      programClassId:  json['program_class_id'] as String? ?? json['id'] as String? ?? '',
      programName:     json['program_name'] as String? ?? '',
      dayOfWeek:       json['day_of_week'] as String? ?? '',
      startTime:       json['start_time'] as String? ?? '',
      endTime:         json['end_time'] as String? ?? '',
      label:           json['label'] as String?,
      coachName:       json['coach_name'] as String?,
      formattedTime:   json['formatted_time'] as String?,
      availableSpots:  json['available_spots'] as int?,
      isFull:          json['is_full'] as bool? ?? false,
      upcomingDates:   (json['upcoming_dates'] as List<dynamic>?)
              ?.map((d) => UpcomingDateModel.fromJson(d as Map<String, dynamic>))
              .toList() ??
          const [],
    );
  }
}

class MakeupSlotModel extends MakeupSlot {
  const MakeupSlotModel({
    required super.id,
    required super.label,
    required super.dayOfWeek,
    required super.startTime,
    required super.endTime,
    super.formattedTime,
    super.availableSpots,
    super.isFull,
  });

  factory MakeupSlotModel.fromJson(Map<String, dynamic> json) {
    return MakeupSlotModel(
      id:             json['id'] as String,
      label:          json['label'] as String? ?? json['day_of_week'] as String? ?? '',
      dayOfWeek:      json['day_of_week'] as String? ?? '',
      startTime:      json['start_time'] as String? ?? '',
      endTime:        json['end_time'] as String? ?? '',
      formattedTime:  json['formatted_time'] as String?,
      availableSpots: json['available_spots'] as int?,
      isFull:         json['is_full'] as bool? ?? false,
    );
  }
}

class UpcomingDateModel extends UpcomingDate {
  const UpcomingDateModel({
    required super.date,
    required super.dayShort,
    required super.dayLong,
    required super.displayDate,
    super.isToday,
    super.isTomorrow,
    super.isCancelled,
    super.cancelReason,
  });

  factory UpcomingDateModel.fromJson(Map<String, dynamic> json) {
    return UpcomingDateModel(
      date:         json['date'] as String? ?? '',
      dayShort:     json['day_short'] as String? ?? '',
      dayLong:      json['day_long'] as String? ?? '',
      displayDate:  json['display_date'] as String? ?? '',
      isToday:      json['is_today'] as bool? ?? false,
      isTomorrow:   json['is_tomorrow'] as bool? ?? false,
      isCancelled:  json['is_cancelled'] as bool? ?? false,
      cancelReason: json['cancel_reason'] as String?,
    );
  }
}
