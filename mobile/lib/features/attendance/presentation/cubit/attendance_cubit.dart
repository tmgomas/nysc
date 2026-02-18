import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../profile/data/repositories/member_repository.dart';
import '../../domain/entities/attendance_record.dart';

// ── States ─────────────────────────────────────────────
abstract class AttendanceState extends Equatable {
  const AttendanceState();
  @override
  List<Object?> get props => [];
}

class AttendanceInitial extends AttendanceState {
  const AttendanceInitial();
}

class AttendanceLoading extends AttendanceState {
  const AttendanceLoading();
}

class AttendanceLoaded extends AttendanceState {
  final List<AttendanceRecord> records;
  const AttendanceLoaded(this.records);
  @override
  List<Object?> get props => [records];
}

class AttendanceError extends AttendanceState {
  final String message;
  const AttendanceError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ──────────────────────────────────────────────
class AttendanceCubit extends Cubit<AttendanceState> {
  final MemberRepository repository;

  AttendanceCubit(this.repository) : super(const AttendanceInitial());

  Future<void> loadAttendance() async {
    emit(const AttendanceLoading());
    final result = await repository.getAttendance();
    result.fold(
      (failure) => emit(AttendanceError(failure.message)),
      (records) => emit(AttendanceLoaded(records)),
    );
  }
}
