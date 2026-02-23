import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/member_program.dart';
import '../datasources/schedule_remote_datasource.dart';
import '../models/schedule_models.dart';

class ScheduleRepository {
  final ScheduleRemoteDataSource remoteDataSource;

  ScheduleRepository(this.remoteDataSource);

  Future<Either<Failure, List<MemberProgram>>> getPrograms() async {
    try {
      final programs = await remoteDataSource.getPrograms();
      return Right(programs);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load programs: $e'));
    }
  }

  Future<Either<Failure, ScheduleResponseModel>> getSchedule({
    int days = 30,
  }) async {
    try {
      final schedule = await remoteDataSource.getSchedule(days: days);
      return Right(schedule);
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
}
