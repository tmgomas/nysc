import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/repositories/coach_repository.dart';
import '../../domain/entities/coach_entities.dart';

// ── States ─────────────────────────────────────────────
abstract class CoachAttendanceState extends Equatable {
  const CoachAttendanceState();
  @override
  List<Object?> get props => [];
}

class CoachAttendanceInitial extends CoachAttendanceState {
  const CoachAttendanceInitial();
}

class CoachAttendanceLoading extends CoachAttendanceState {
  const CoachAttendanceLoading();
}

class CoachAttendanceLoaded extends CoachAttendanceState {
  final List<CoachAttendanceRecord> records;
  const CoachAttendanceLoaded(this.records);
  @override
  List<Object?> get props => [records];
}

class CoachAttendanceMarking extends CoachAttendanceState {
  final List<CoachAttendanceRecord> records;
  const CoachAttendanceMarking(this.records);
  @override
  List<Object?> get props => [records];
}

class CoachAttendanceMarked extends CoachAttendanceState {
  final List<CoachAttendanceRecord> records;
  final String message;
  const CoachAttendanceMarked(this.records, this.message);
  @override
  List<Object?> get props => [records, message];
}

class CoachAttendanceError extends CoachAttendanceState {
  final String message;
  const CoachAttendanceError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ──────────────────────────────────────────────
class CoachAttendanceCubit extends Cubit<CoachAttendanceState> {
  final CoachRepository repository;

  CoachAttendanceCubit(this.repository) : super(const CoachAttendanceInitial());

  Future<void> loadAttendance({String? date}) async {
    emit(const CoachAttendanceLoading());
    final result = await repository.getAttendance(date: date);
    result.fold(
      (failure) => emit(CoachAttendanceError(failure.message)),
      (records) => emit(CoachAttendanceLoaded(records)),
    );
  }

  Future<void> markAttendance({
    required String memberId,
    required String programId,
    String method = 'manual',
  }) async {
    final currentRecords = state is CoachAttendanceLoaded
        ? (state as CoachAttendanceLoaded).records
        : <CoachAttendanceRecord>[];

    emit(CoachAttendanceMarking(currentRecords));

    final result = await repository.markAttendance(
      memberId: memberId,
      programId: programId,
      method: method,
    );

    result.fold(
      (failure) => emit(CoachAttendanceError(failure.message)),
      (record) {
        // Refresh the entire list after marking
        loadAttendance();
      },
    );
  }
}
