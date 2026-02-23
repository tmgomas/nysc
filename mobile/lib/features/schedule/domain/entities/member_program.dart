import 'package:equatable/equatable.dart';

/// A practice day entry from practice_days programs.
class PracticeDay extends Equatable {
  final String day;
  final String? startTime;
  final String? endTime;
  final String? formattedTime;

  const PracticeDay({
    required this.day,
    this.startTime,
    this.endTime,
    this.formattedTime,
  });

  @override
  List<Object?> get props => [day, startTime];
}

/// An assigned class slot within a class_based program.
class AssignedClass extends Equatable {
  final String id;
  final String? label;
  final String? dayOfWeek;
  final String? formattedTime;
  final String? coach;

  const AssignedClass({
    required this.id,
    this.label,
    this.dayOfWeek,
    this.formattedTime,
    this.coach,
  });

  @override
  List<Object?> get props => [id];
}

/// A program the member is enrolled in.
class MemberProgram extends Equatable {
  final String id;
  final String? name;
  final String? shortCode;
  final String? monthlyFee;
  final String? location;
  final String? enrolledAt;
  final String? status;
  final String scheduleType; // 'practice_days' | 'class_based'

  // practice_days
  final List<PracticeDay> practiceDays;

  // class_based
  final List<AssignedClass> assignedClasses;

  const MemberProgram({
    required this.id,
    this.name,
    this.shortCode,
    this.monthlyFee,
    this.location,
    this.enrolledAt,
    this.status,
    this.scheduleType = 'practice_days',
    this.practiceDays = const [],
    this.assignedClasses = const [],
  });

  bool get isPracticeDays => scheduleType == 'practice_days';

  @override
  List<Object?> get props => [id];
}
