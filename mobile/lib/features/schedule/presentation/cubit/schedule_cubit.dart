import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/schedule_models.dart';
import '../../data/repositories/schedule_repository.dart';
import '../../domain/entities/member_program.dart';

// ── Programs States ─────────────────────────────────────
abstract class ProgramsState extends Equatable {
  const ProgramsState();
  @override
  List<Object?> get props => [];
}

class ProgramsInitial extends ProgramsState {
  const ProgramsInitial();
}

class ProgramsLoading extends ProgramsState {
  const ProgramsLoading();
}

class ProgramsLoaded extends ProgramsState {
  final List<MemberProgram> programs;
  const ProgramsLoaded(this.programs);
  @override
  List<Object?> get props => [programs];
}

class ProgramsError extends ProgramsState {
  final String message;
  const ProgramsError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Schedule States ─────────────────────────────────────
abstract class ScheduleState extends Equatable {
  const ScheduleState();
  @override
  List<Object?> get props => [];
}

class ScheduleInitial extends ScheduleState {
  const ScheduleInitial();
}

class ScheduleLoading extends ScheduleState {
  const ScheduleLoading();
}

class ScheduleLoaded extends ScheduleState {
  final ScheduleResponseModel schedule;
  const ScheduleLoaded(this.schedule);
  @override
  List<Object?> get props => [schedule];
}

class ScheduleError extends ScheduleState {
  final String message;
  const ScheduleError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Programs Cubit ──────────────────────────────────────
class ProgramsCubit extends Cubit<ProgramsState> {
  final ScheduleRepository repository;

  ProgramsCubit(this.repository) : super(const ProgramsInitial());

  Future<void> loadPrograms() async {
    emit(const ProgramsLoading());
    final result = await repository.getPrograms();
    result.fold(
      (failure) => emit(ProgramsError(failure.message)),
      (programs) => emit(ProgramsLoaded(programs)),
    );
  }
}

// ── Schedule Cubit ──────────────────────────────────────
class ScheduleCubit extends Cubit<ScheduleState> {
  final ScheduleRepository repository;

  ScheduleCubit(this.repository) : super(const ScheduleInitial());

  Future<void> loadSchedule({int days = 30}) async {
    emit(const ScheduleLoading());
    final result = await repository.getSchedule(days: days);
    result.fold(
      (failure) => emit(ScheduleError(failure.message)),
      (schedule) => emit(ScheduleLoaded(schedule)),
    );
  }
}
