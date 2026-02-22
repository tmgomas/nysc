import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/assigned_class.dart';
import '../../domain/entities/class_absence.dart';
import '../datasources/absence_remote_datasource.dart';

class AbsenceRepository {
  final AbsenceRemoteDataSource remoteDataSource;

  AbsenceRepository(this.remoteDataSource);

  Future<Either<Failure, List<AssignedClass>>> getMyClasses() async {
    try {
      return Right(await remoteDataSource.getMyClasses());
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load classes: $e'));
    }
  }

  Future<Either<Failure, List<ClassAbsence>>> getMyAbsences() async {
    try {
      return Right(await remoteDataSource.getMyAbsences());
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load absences: $e'));
    }
  }

  Future<Either<Failure, ClassAbsence>> reportAbsence({
    required String programClassId,
    required String absentDate,
    String? reason,
  }) async {
    try {
      final result = await remoteDataSource.reportAbsence(
        programClassId: programClassId,
        absentDate: absentDate,
        reason: reason,
      );
      return Right(result);
    } on BadRequestException catch (e) {
      return Left(ServerFailure(e.message));
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to report absence: $e'));
    }
  }

  Future<Either<Failure, List<AssignedClass>>> getMakeupSlots(String absenceId) async {
    try {
      return Right(await remoteDataSource.getMakeupSlots(absenceId));
    } on BadRequestException catch (e) {
      return Left(ServerFailure(e.message));
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to load makeup slots: $e'));
    }
  }

  Future<Either<Failure, void>> selectMakeup({
    required String absenceId,
    required String makeupClassId,
    required String makeupDate,
  }) async {
    try {
      await remoteDataSource.selectMakeup(
        absenceId: absenceId,
        makeupClassId: makeupClassId,
        makeupDate: makeupDate,
      );
      return const Right(null);
    } on BadRequestException catch (e) {
      return Left(ServerFailure(e.message));
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('Failed to book makeup class: $e'));
    }
  }
}
