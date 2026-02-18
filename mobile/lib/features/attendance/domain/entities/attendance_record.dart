import 'package:equatable/equatable.dart';

/// Attendance record domain entity.
class AttendanceRecord extends Equatable {
  final String id;
  final String? checkInTime;
  final String? checkOutTime;
  final int? durationMinutes;
  final String? method;
  final String? notes;
  final String? programName;

  const AttendanceRecord({
    required this.id,
    this.checkInTime,
    this.checkOutTime,
    this.durationMinutes,
    this.method,
    this.notes,
    this.programName,
  });

  @override
  List<Object?> get props => [id, checkInTime];
}
