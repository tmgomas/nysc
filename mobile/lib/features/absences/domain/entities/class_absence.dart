import 'package:equatable/equatable.dart';

/// Absence status lifecycle
enum AbsenceStatus {
  pending,
  approved,
  rejected,
  makeupSelected,
  completed,
  expired,
  noMakeup,
  unknown;

  static AbsenceStatus fromString(String? s) {
    switch (s) {
      case 'pending':          return AbsenceStatus.pending;
      case 'approved':         return AbsenceStatus.approved;
      case 'rejected':         return AbsenceStatus.rejected;
      case 'makeup_selected':  return AbsenceStatus.makeupSelected;
      case 'completed':        return AbsenceStatus.completed;
      case 'expired':          return AbsenceStatus.expired;
      case 'no_makeup':        return AbsenceStatus.noMakeup;
      default:                 return AbsenceStatus.unknown;
    }
  }

  String get label {
    switch (this) {
      case AbsenceStatus.pending:        return 'Pending';
      case AbsenceStatus.approved:       return 'Approved';
      case AbsenceStatus.rejected:       return 'Rejected';
      case AbsenceStatus.makeupSelected: return 'Makeup Booked';
      case AbsenceStatus.completed:      return 'Completed';
      case AbsenceStatus.expired:        return 'Expired';
      case AbsenceStatus.noMakeup:       return 'No Makeup';
      case AbsenceStatus.unknown:        return 'Unknown';
    }
  }

  bool get canSelectMakeup => this == AbsenceStatus.approved;
  bool get isPending => this == AbsenceStatus.pending;
  bool get isUrgent => this == AbsenceStatus.approved;
}

/// Class absence domain entity
class ClassAbsence extends Equatable {
  final String id;
  final String programClassId;
  final String absentDate;
  final String? reason;
  final AbsenceStatus status;

  // Class info
  final String? className;
  final String? programName;
  final String? classDay;
  final String? classTime;

  // Admin decision
  final String? adminNotes;
  final String? makeupDeadline;
  final int? daysLeft;

  // Makeup info
  final String? makeupClassId;
  final String? makeupDate;
  final String? makeupClassName;
  final String? makeupClassDay;

  const ClassAbsence({
    required this.id,
    required this.programClassId,
    required this.absentDate,
    required this.status,
    this.reason,
    this.className,
    this.programName,
    this.classDay,
    this.classTime,
    this.adminNotes,
    this.makeupDeadline,
    this.daysLeft,
    this.makeupClassId,
    this.makeupDate,
    this.makeupClassName,
    this.makeupClassDay,
  });

  bool get isDeadlineUrgent => status == AbsenceStatus.approved && (daysLeft ?? 99) <= 2;

  @override
  List<Object?> get props => [id, status, absentDate];
}
