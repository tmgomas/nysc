import '../../domain/entities/class_absence.dart';

class ClassAbsenceModel extends ClassAbsence {
  const ClassAbsenceModel({
    required super.id,
    required super.programClassId,
    required super.absentDate,
    required super.status,
    super.reason,
    super.className,
    super.programName,
    super.classDay,
    super.classTime,
    super.adminNotes,
    super.makeupDeadline,
    super.daysLeft,
    super.makeupClassId,
    super.makeupDate,
    super.makeupClassName,
    super.makeupClassDay,
  });

  factory ClassAbsenceModel.fromJson(Map<String, dynamic> json) {
    final programClass  = json['program_class'] as Map<String, dynamic>?;
    final makeupClass   = json['makeup_class']  as Map<String, dynamic>?;

    return ClassAbsenceModel(
      id:              json['id'] as String,
      programClassId:  json['program_class_id'] as String,
      absentDate:      json['absent_date'] as String,
      reason:          json['reason'] as String?,
      status:          AbsenceStatus.fromString(json['status'] as String?),
      adminNotes:      json['admin_notes'] as String?,
      makeupDeadline:  json['makeup_deadline'] as String?,
      daysLeft:        json['days_left'] as int?,

      // Program class info
      className:       programClass?['label'] as String? ?? programClass?['day_of_week'] as String?,
      programName:     (programClass?['program'] as Map<String, dynamic>?)?['name'] as String?,
      classDay:        programClass?['day_of_week'] as String?,
      classTime:       programClass?['formatted_time'] as String?,

      // Makeup class info
      makeupClassId:   json['makeup_class_id'] as String?,
      makeupDate:      json['makeup_date'] as String?,
      makeupClassName: makeupClass?['label'] as String? ?? makeupClass?['day_of_week'] as String?,
      makeupClassDay:  makeupClass?['day_of_week'] as String?,
    );
  }
}
