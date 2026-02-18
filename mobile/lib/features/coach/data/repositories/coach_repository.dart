import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/coach_entities.dart';
import '../datasources/coach_remote_datasource.dart';

/// Repository for all coach-related data operations.
class CoachRepository {
  final CoachRemoteDataSource remoteDataSource;

  CoachRepository(this.remoteDataSource);

  Future<Either<Failure, CoachDashboard>> getDashboard() async {
    try {
      final dashboard = await remoteDataSource.getDashboard();
      return Right(dashboard);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load dashboard: $e'));
    }
  }

  Future<Either<Failure, List<CoachClass>>> getTodaySchedule() async {
    try {
      final classes = await remoteDataSource.getTodaySchedule();
      return Right(classes);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load schedule: $e'));
    }
  }

  Future<Either<Failure, List<CoachAttendanceRecord>>> getAttendance({
    String? date,
  }) async {
    try {
      final records = await remoteDataSource.getAttendance(date: date);
      return Right(records);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load attendance: $e'));
    }
  }

  Future<Either<Failure, CoachAttendanceRecord>> markAttendance({
    required String memberId,
    required String programId,
    String method = 'manual',
  }) async {
    try {
      final record = await remoteDataSource.markAttendance(
        memberId: memberId,
        programId: programId,
        method: method,
      );
      return Right(record);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to mark attendance: $e'));
    }
  }
}
