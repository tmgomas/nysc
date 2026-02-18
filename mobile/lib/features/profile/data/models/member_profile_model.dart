import '../../domain/entities/member_profile.dart';

/// Member profile data model with JSON deserialization.
class MemberProfileModel extends MemberProfile {
  const MemberProfileModel({
    required super.id,
    required super.memberNumber,
    required super.fullName,
    super.callingName,
    super.email,
    super.contactNumber,
    super.dateOfBirth,
    super.gender,
    super.address,
    super.photoUrl,
    super.bloodGroup,
    super.jerseySize,
    super.status,
    super.membershipType,
    super.registrationDate,
    super.programs,
  });

  factory MemberProfileModel.fromJson(Map<String, dynamic> json) {
    final programsList = (json['programs'] as List<dynamic>?)
            ?.map((p) => ProgramEnrollmentModel.fromJson(p as Map<String, dynamic>))
            .toList() ??
        [];

    return MemberProfileModel(
      id: json['id'] as String,
      memberNumber: json['member_number'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      callingName: json['calling_name'] as String?,
      email: json['email'] as String?,
      contactNumber: json['contact_number'] as String?,
      dateOfBirth: json['date_of_birth'] as String?,
      gender: json['gender'] as String?,
      address: json['address'] as String?,
      photoUrl: json['photo_url'] as String?,
      bloodGroup: json['blood_group'] as String?,
      jerseySize: json['jersey_size'] as String?,
      status: json['status'] as String?,
      membershipType: json['membership_type'] as String?,
      registrationDate: json['registration_date'] as String?,
      programs: programsList,
    );
  }
}

class ProgramEnrollmentModel extends ProgramEnrollment {
  const ProgramEnrollmentModel({
    required super.id,
    required super.name,
    super.shortCode,
    super.description,
    super.monthlyFee,
    super.scheduleType,
    super.schedule,
    super.isActive,
  });

  factory ProgramEnrollmentModel.fromJson(Map<String, dynamic> json) {
    return ProgramEnrollmentModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      shortCode: json['short_code'] as String?,
      description: json['description'] as String?,
      monthlyFee: json['monthly_fee']?.toString(),
      scheduleType: json['schedule_type'] as String?,
      schedule: json['schedule'],
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}
