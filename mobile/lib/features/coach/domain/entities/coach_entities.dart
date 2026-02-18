import 'package:equatable/equatable.dart';

/// Coach dashboard data entity.
class CoachDashboard extends Equatable {
  final int todayAttendanceCount;
  final List<CoachProgram> programs;

  const CoachDashboard({
    required this.todayAttendanceCount,
    this.programs = const [],
  });

  @override
  List<Object?> get props => [todayAttendanceCount, programs];
}

/// Coach program summary entity.
class CoachProgram extends Equatable {
  final String id;
  final String name;
  final String? shortCode;
  final int activeMembersCount;

  const CoachProgram({
    required this.id,
    required this.name,
    this.shortCode,
    this.activeMembersCount = 0,
  });

  @override
  List<Object?> get props => [id, name];
}

/// Today's class for coach entity.
class CoachClass extends Equatable {
  final String id;
  final String programName;
  final String startTime;
  final String endTime;

  const CoachClass({
    required this.id,
    required this.programName,
    required this.startTime,
    required this.endTime,
  });

  @override
  List<Object?> get props => [id, programName];
}

/// Coach attendance record entity (includes member info).
class CoachAttendanceRecord extends Equatable {
  final String id;
  final String? memberName;
  final String? memberNumber;
  final String? programName;
  final String? checkInTime;
  final String? checkOutTime;
  final int? durationMinutes;
  final String? method;

  const CoachAttendanceRecord({
    required this.id,
    this.memberName,
    this.memberNumber,
    this.programName,
    this.checkInTime,
    this.checkOutTime,
    this.durationMinutes,
    this.method,
  });

  bool get isCheckedOut => checkOutTime != null;

  @override
  List<Object?> get props => [id, memberName, checkInTime];
}
