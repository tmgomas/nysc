import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../../attendance/domain/entities/attendance_record.dart';
import '../../../payments/domain/entities/payment.dart';
import '../../domain/entities/member_profile.dart';
import '../../../schedule/domain/entities/schedule_class.dart';
import '../datasources/member_remote_datasource.dart';

/// Repository that consolidates all member-related data operations.
class MemberRepository {
  final MemberRemoteDataSource remoteDataSource;

  MemberRepository(this.remoteDataSource);

  Future<Either<Failure, MemberProfile>> getProfile() async {
    try {
      final profile = await remoteDataSource.getProfile();
      return Right(profile);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load profile: $e'));
    }
  }

  Future<Either<Failure, MemberProfile>> updateProfile(
    Map<String, dynamic> data,
  ) async {
    try {
      final profile = await remoteDataSource.updateProfile(data);
      return Right(profile);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to update profile: $e'));
    }
  }

  Future<Either<Failure, List<Payment>>> getPayments({int page = 1}) async {
    try {
      final payments = await remoteDataSource.getPayments(page: page);
      return Right(payments);
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load payments: $e'));
    }
  }

  Future<Either<Failure, List<ScheduleClass>>> getSchedule() async {
    try {
      final schedule = await remoteDataSource.getSchedule();
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

  Future<Either<Failure, List<AttendanceRecord>>> getAttendance({
    int page = 1,
  }) async {
    try {
      final attendance = await remoteDataSource.getAttendance(page: page);
      return Right(attendance);
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
}
