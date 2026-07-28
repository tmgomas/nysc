 import 'package:dartz/dartz.dart';
import '../../../../core/error/exceptions.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_local_datasource.dart';
import 'package:flutter/foundation.dart';
import '../../../../core/services/firebase_service.dart';
import '../datasources/auth_remote_datasource.dart';

/// Concrete auth repository implementation.
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final FirebaseService firebaseService;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.firebaseService,
  });

  @override
  Future<Either<Failure, (User, String)>> login(
    String email,
    String password,
  ) async {
    try {
      final result = await remoteDataSource.login(email, password);
      final (user, token) = result;
      await localDataSource.saveToken(token);
      
      // Register Firebase device token
      try {
        final fcmToken = await firebaseService.getDeviceToken();
        if (fcmToken != null) {
          final deviceType = kIsWeb ? 'web' : (defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android');
          await remoteDataSource.registerDeviceToken(fcmToken, deviceType);
        }
      } catch (e) {
        // Don't fail login if push notification registration fails
        print('Failed to register device token: $e');
      }

      return Right((user, token));
    } on UnauthorizedException catch (e) {
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('An unexpected error occurred: $e'));
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      final user = await remoteDataSource.getCurrentUser();
      return Right(user);
    } on UnauthorizedException catch (e) {
      await localDataSource.deleteToken();
      return Left(UnauthorizedFailure(e.message));
    } on NetworkException catch (e) {
      return Left(NetworkFailure(e.message));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure('An unexpected error occurred: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await remoteDataSource.logout();
      await localDataSource.deleteToken();
      return const Right(null);
    } on NetworkException {
      // Even if network fails, clear local token
      await localDataSource.deleteToken();
      return const Right(null);
    } catch (e) {
      await localDataSource.deleteToken();
      return const Right(null);
    }
  }

  @override
  Future<bool> hasToken() => localDataSource.hasToken();
}
