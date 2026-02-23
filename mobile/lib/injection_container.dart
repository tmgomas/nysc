import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:get_it/get_it.dart';
import 'core/network/api_client.dart';
import 'core/network/network_info.dart';
import 'core/storage/secure_storage.dart';
import 'features/auth/data/datasources/auth_local_datasource.dart';
import 'features/auth/data/datasources/auth_remote_datasource.dart';
import 'features/auth/data/repositories/auth_repository_impl.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/domain/usecases/login_usecase.dart';
import 'features/auth/domain/usecases/logout_usecase.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/profile/data/datasources/member_remote_datasource.dart';
import 'features/profile/data/repositories/member_repository.dart';
import 'features/profile/presentation/cubit/profile_cubit.dart';
import 'features/payments/presentation/cubit/payments_cubit.dart';

import 'features/attendance/presentation/cubit/attendance_cubit.dart';
import 'features/coach/data/datasources/coach_remote_datasource.dart';
import 'features/coach/data/repositories/coach_repository.dart';
import 'features/coach/presentation/cubit/coach_dashboard_cubit.dart';
import 'features/coach/presentation/cubit/coach_attendance_cubit.dart';
import 'features/schedule/data/datasources/schedule_remote_datasource.dart';
import 'features/schedule/data/repositories/schedule_repository.dart';
import 'features/schedule/presentation/cubit/schedule_cubit.dart';


final getIt = GetIt.instance;

/// Register all dependencies.
Future<void> setupDependencies() async {
  // ── Core ──────────────────────────────────────────────
  getIt.registerLazySingleton<SecureStorageService>(
    () => SecureStorageService(),
  );

  getIt.registerLazySingleton<ApiClient>(
    () => ApiClient(getIt<SecureStorageService>()),
  );

  getIt.registerLazySingleton<NetworkInfo>(
    () => NetworkInfoImpl(Connectivity()),
  );

  // ── Auth: Data Sources ────────────────────────────────
  getIt.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(getIt<ApiClient>()),
  );

  getIt.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(getIt<SecureStorageService>()),
  );

  // ── Auth: Repository ──────────────────────────────────
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: getIt<AuthRemoteDataSource>(),
      localDataSource: getIt<AuthLocalDataSource>(),
    ),
  );

  // ── Auth: Use Cases ───────────────────────────────────
  getIt.registerFactory(() => LoginUseCase(getIt<AuthRepository>()));
  getIt.registerFactory(() => LogoutUseCase(getIt<AuthRepository>()));

  // ── Auth: BLoC ────────────────────────────────────────
  getIt.registerFactory(
    () => AuthBloc(
      loginUseCase: getIt<LoginUseCase>(),
      logoutUseCase: getIt<LogoutUseCase>(),
      authRepository: getIt<AuthRepository>(),
    ),
  );

  // ── Member: Data Sources ──────────────────────────────
  getIt.registerLazySingleton<MemberRemoteDataSource>(
    () => MemberRemoteDataSource(getIt<ApiClient>()),
  );

  // ── Member: Repository ────────────────────────────────
  getIt.registerLazySingleton<MemberRepository>(
    () => MemberRepository(getIt<MemberRemoteDataSource>()),
  );

  // ── Feature Cubits ────────────────────────────────────
  getIt.registerFactory(() => ProfileCubit(getIt<MemberRepository>()));
  getIt.registerFactory(() => PaymentsCubit(getIt<MemberRepository>()));

  getIt.registerFactory(() => AttendanceCubit(getIt<MemberRepository>()));

  // ── Coach: Data Sources ───────────────────────────────
  getIt.registerLazySingleton<CoachRemoteDataSource>(
    () => CoachRemoteDataSource(getIt<ApiClient>()),
  );

  // ── Coach: Repository ─────────────────────────────────
  getIt.registerLazySingleton<CoachRepository>(
    () => CoachRepository(getIt<CoachRemoteDataSource>()),
  );

  // ── Coach: Cubits ─────────────────────────────────────
  getIt.registerFactory(() => CoachDashboardCubit(getIt<CoachRepository>()));
  getIt.registerFactory(() => CoachAttendanceCubit(getIt<CoachRepository>()));

  // ── Schedule: Data Sources ────────────────────────────
  getIt.registerLazySingleton<ScheduleRemoteDataSource>(
    () => ScheduleRemoteDataSource(getIt<ApiClient>()),
  );

  // ── Schedule: Repository ──────────────────────────────
  getIt.registerLazySingleton<ScheduleRepository>(
    () => ScheduleRepository(getIt<ScheduleRemoteDataSource>()),
  );

  // ── Schedule: Cubits ──────────────────────────────────
  getIt.registerFactory(() => ProgramsCubit(getIt<ScheduleRepository>()));
  getIt.registerFactory(() => ScheduleCubit(getIt<ScheduleRepository>()));
}
