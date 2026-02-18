import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../profile/data/repositories/member_repository.dart';
import '../../domain/entities/schedule_class.dart';

// ── States ─────────────────────────────────────────────
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
  final List<ScheduleClass> classes;
  const ScheduleLoaded(this.classes);

  /// Group classes by day of week.
  Map<String, List<ScheduleClass>> get groupedByDay {
    final map = <String, List<ScheduleClass>>{};
    for (final c in classes) {
      map.putIfAbsent(c.dayOfWeek, () => []).add(c);
    }
    return map;
  }

  @override
  List<Object?> get props => [classes];
}

class ScheduleError extends ScheduleState {
  final String message;
  const ScheduleError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ──────────────────────────────────────────────
class ScheduleCubit extends Cubit<ScheduleState> {
  final MemberRepository repository;

  ScheduleCubit(this.repository) : super(const ScheduleInitial());

  Future<void> loadSchedule() async {
    emit(const ScheduleLoading());
    final result = await repository.getSchedule();
    result.fold(
      (failure) => emit(ScheduleError(failure.message)),
      (classes) => emit(ScheduleLoaded(classes)),
    );
  }
}
