import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/assigned_class.dart';
import '../../domain/entities/class_absence.dart';
import '../../data/repositories/absence_repository.dart';

// ── States ──────────────────────────────────────────────────────────────────

abstract class AbsenceState extends Equatable {
  const AbsenceState();
  @override
  List<Object?> get props => [];
}

class AbsenceInitial extends AbsenceState {
  const AbsenceInitial();
}

class AbsenceLoading extends AbsenceState {
  const AbsenceLoading();
}

class MyClassesLoaded extends AbsenceState {
  final List<AssignedClass> classes;
  const MyClassesLoaded(this.classes);
  @override
  List<Object?> get props => [classes];
}

class MyAbsencesLoaded extends AbsenceState {
  final List<ClassAbsence> absences;
  /// Pending absences count for badge
  int get pendingCount => absences.where((a) => a.status.isPending).length;
  /// Absences awaiting makeup selection
  List<ClassAbsence> get awaitingMakeup =>
      absences.where((a) => a.status.canSelectMakeup).toList();
  const MyAbsencesLoaded(this.absences);
  @override
  List<Object?> get props => [absences];
}

class AbsenceReported extends AbsenceState {
  final ClassAbsence absence;
  const AbsenceReported(this.absence);
  @override
  List<Object?> get props => [absence];
}

class MakeupSlotsLoaded extends AbsenceState {
  final String absenceId;
  final List<AssignedClass> slots;
  const MakeupSlotsLoaded({required this.absenceId, required this.slots});
  @override
  List<Object?> get props => [absenceId, slots];
}

class MakeupBooked extends AbsenceState {
  const MakeupBooked();
}

class AbsenceError extends AbsenceState {
  final String message;
  const AbsenceError(this.message);
  @override
  List<Object?> get props => [message];
}

class AbsenceActionLoading extends AbsenceState {
  final String action; // 'reporting', 'loading_slots', 'booking'
  const AbsenceActionLoading(this.action);
}

// ── Cubit ────────────────────────────────────────────────────────────────────

class AbsenceCubit extends Cubit<AbsenceState> {
  final AbsenceRepository repository;

  AbsenceCubit(this.repository) : super(const AbsenceInitial());

  Future<void> loadMyClasses() async {
    emit(const AbsenceLoading());
    final result = await repository.getMyClasses();
    result.fold(
      (failure) => emit(AbsenceError(failure.message)),
      (classes)  => emit(MyClassesLoaded(classes)),
    );
  }

  Future<void> loadMyAbsences() async {
    emit(const AbsenceLoading());
    final result = await repository.getMyAbsences();
    result.fold(
      (failure)  => emit(AbsenceError(failure.message)),
      (absences) => emit(MyAbsencesLoaded(absences)),
    );
  }

  Future<void> reportAbsence({
    required String programClassId,
    required String absentDate,
    String? reason,
  }) async {
    emit(const AbsenceActionLoading('reporting'));
    final result = await repository.reportAbsence(
      programClassId: programClassId,
      absentDate: absentDate,
      reason: reason,
    );
    result.fold(
      (failure) => emit(AbsenceError(failure.message)),
      (absence) => emit(AbsenceReported(absence)),
    );
  }

  Future<void> loadMakeupSlots(String absenceId) async {
    emit(const AbsenceActionLoading('loading_slots'));
    final result = await repository.getMakeupSlots(absenceId);
    result.fold(
      (failure) => emit(AbsenceError(failure.message)),
      (slots)   => emit(MakeupSlotsLoaded(absenceId: absenceId, slots: slots)),
    );
  }

  Future<void> selectMakeup({
    required String absenceId,
    required String makeupClassId,
    required String makeupDate,
  }) async {
    emit(const AbsenceActionLoading('booking'));
    final result = await repository.selectMakeup(
      absenceId: absenceId,
      makeupClassId: makeupClassId,
      makeupDate: makeupDate,
    );
    result.fold(
      (failure) => emit(AbsenceError(failure.message)),
      (_)       => emit(const MakeupBooked()),
    );
  }
}
