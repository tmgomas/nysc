import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/repositories/coach_repository.dart';
import '../../domain/entities/coach_entities.dart';

// ── States ─────────────────────────────────────────────
abstract class CoachDashboardState extends Equatable {
  const CoachDashboardState();
  @override
  List<Object?> get props => [];
}

class CoachDashboardInitial extends CoachDashboardState {
  const CoachDashboardInitial();
}

class CoachDashboardLoading extends CoachDashboardState {
  const CoachDashboardLoading();
}

class CoachDashboardLoaded extends CoachDashboardState {
  final CoachDashboard dashboard;
  final List<CoachClass> todayClasses;

  const CoachDashboardLoaded({
    required this.dashboard,
    this.todayClasses = const [],
  });

  @override
  List<Object?> get props => [dashboard, todayClasses];
}

class CoachDashboardError extends CoachDashboardState {
  final String message;
  const CoachDashboardError(this.message);
  @override
  List<Object?> get props => [message];
}

// ── Cubit ──────────────────────────────────────────────
class CoachDashboardCubit extends Cubit<CoachDashboardState> {
  final CoachRepository repository;

  CoachDashboardCubit(this.repository) : super(const CoachDashboardInitial());

  Future<void> loadDashboard() async {
    emit(const CoachDashboardLoading());

    final dashboardResult = await repository.getDashboard();

    await dashboardResult.fold(
      (failure) async => emit(CoachDashboardError(failure.message)),
      (dashboard) async {
        final scheduleResult = await repository.getTodaySchedule();
        scheduleResult.fold(
          (failure) => emit(CoachDashboardLoaded(
            dashboard: dashboard,
            todayClasses: const [],
          )),
          (classes) => emit(CoachDashboardLoaded(
            dashboard: dashboard,
            todayClasses: classes,
          )),
        );
      },
    );
  }
}
