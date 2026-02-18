import 'package:equatable/equatable.dart';

/// Schedule class domain entity.
class ScheduleClass extends Equatable {
  final String id;
  final String programName;
  final String? programShortCode;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final String? locationName;

  const ScheduleClass({
    required this.id,
    required this.programName,
    this.programShortCode,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.locationName,
  });

  @override
  List<Object?> get props => [id, programName, dayOfWeek];
}
