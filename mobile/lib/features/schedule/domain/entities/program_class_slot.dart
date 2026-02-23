import 'package:equatable/equatable.dart';

/// A single upcoming class occurrence (one row in the calendar).
class ProgramClassSlot extends Equatable {
  final String id;
  final String? programClassId;
  final String date;
  final String? dayOfWeek;
  final String? startTime;
  final String? endTime;
  final String? formattedTime;
  final String? programName;
  final String? programShortCode;
  final String? label;
  final String? coach;
  final String? location;
  final String status; // 'scheduled' | 'cancelled'
  final String? cancellationReason;
  final bool isHoliday;
  final String? holidayName;

  const ProgramClassSlot({
    required this.id,
    this.programClassId,
    required this.date,
    this.dayOfWeek,
    this.startTime,
    this.endTime,
    this.formattedTime,
    this.programName,
    this.programShortCode,
    this.label,
    this.coach,
    this.location,
    this.status = 'scheduled',
    this.cancellationReason,
    this.isHoliday = false,
    this.holidayName,
  });

  bool get isCancelled => status == 'cancelled';

  @override
  List<Object?> get props => [id, date, status];
}
