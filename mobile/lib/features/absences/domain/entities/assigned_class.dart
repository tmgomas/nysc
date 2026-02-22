import 'package:equatable/equatable.dart';

/// A single upcoming occurrence of a class slot
class UpcomingDate extends Equatable {
  final String date;        // 2026-02-24
  final String dayShort;    // Mon
  final String dayLong;     // Monday
  final String displayDate; // Feb 24
  final bool isToday;
  final bool isTomorrow;
  final bool isCancelled;
  final String? cancelReason;

  const UpcomingDate({
    required this.date,
    required this.dayShort,
    required this.dayLong,
    required this.displayDate,
    this.isToday = false,
    this.isTomorrow = false,
    this.isCancelled = false,
    this.cancelReason,
  });

  String get label {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return displayDate;
  }

  @override
  List<Object?> get props => [date];
}

/// Represents a specific recurring class slot (e.g., Monday 6AM Swimming)
class AssignedClass extends Equatable {
  final String assignmentId;
  final String programClassId;
  final String programName;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String? label;
  final String? coachName;
  final String? formattedTime;
  final int? availableSpots;
  final bool isFull;
  final List<UpcomingDate> upcomingDates;

  const AssignedClass({
    required this.assignmentId,
    required this.programClassId,
    required this.programName,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.label,
    this.coachName,
    this.formattedTime,
    this.availableSpots,
    this.isFull = false,
    this.upcomingDates = const [],
  });

  String get displayName => label ?? dayOfWeek;
  String get timeDisplay => formattedTime ?? '$startTime - $endTime';

  @override
  List<Object?> get props => [assignmentId, programClassId];
}

/// Represents an available class slot for makeup selection
class MakeupSlot extends Equatable {
  final String id;
  final String label;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String? formattedTime;
  final int? availableSpots;
  final bool isFull;

  const MakeupSlot({
    required this.id,
    required this.label,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.formattedTime,
    this.availableSpots,
    this.isFull = false,
  });

  String get timeDisplay => formattedTime ?? '$startTime - $endTime';

  @override
  List<Object?> get props => [id];
}
