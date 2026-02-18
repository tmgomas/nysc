import 'package:equatable/equatable.dart';

/// Member profile domain entity.
class MemberProfile extends Equatable {
  final String id;
  final String memberNumber;
  final String fullName;
  final String? callingName;
  final String? email;
  final String? contactNumber;
  final String? dateOfBirth;
  final String? gender;
  final String? address;
  final String? photoUrl;
  final String? bloodGroup;
  final String? jerseySize;
  final String? status;
  final String? membershipType;
  final String? registrationDate;
  final List<ProgramEnrollment> programs;

  const MemberProfile({
    required this.id,
    required this.memberNumber,
    required this.fullName,
    this.callingName,
    this.email,
    this.contactNumber,
    this.dateOfBirth,
    this.gender,
    this.address,
    this.photoUrl,
    this.bloodGroup,
    this.jerseySize,
    this.status,
    this.membershipType,
    this.registrationDate,
    this.programs = const [],
  });

  @override
  List<Object?> get props => [id, memberNumber, fullName];
}

/// Program enrollment entity.
class ProgramEnrollment extends Equatable {
  final String id;
  final String name;
  final String? shortCode;
  final String? description;
  final String? monthlyFee;
  final String? scheduleType;
  final dynamic schedule;
  final bool isActive;

  const ProgramEnrollment({
    required this.id,
    required this.name,
    this.shortCode,
    this.description,
    this.monthlyFee,
    this.scheduleType,
    this.schedule,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, name];
}
